-- SPDX-License-Identifier: GPL-3.0-only
-- Writes only this mod's saveX.dat via the game's supported API.
local mod = RegisterMod("Isaac Atlas Bridge", 1)
local json = require("json")
local active, finished, lastWrite, sequence, run = false, false, -1000, 0, ""
local function snapshot(state)
    local game = Game()
    if game:GetNumPlayers() < 1 then return end
    local player = Isaac.GetPlayer(0)
    local items, cards = {}, {}
    local configs = Isaac.GetItemConfig():GetCollectibles()
    for id = 1, configs.Size - 1 do
        if player:HasCollectible(id) then items[#items + 1] = id end
    end
    for i = 0, 3 do
        local card = player:GetCard(i)
        if card > 0 then cards[#cards + 1] = card end
    end
    sequence = sequence + 1
    mod:SaveData(json.encode({schema=1, state=state, sequence=sequence, run=run,
        frames=math.max(0, game.TimeCounter), playerType=player:GetPlayerType(),
        difficulty=game.Difficulty, stage=game:GetLevel():GetStage(),
        challenge=game.Challenge, custom=game:GetSeeds():IsCustomRun(),
        players=game:GetNumPlayers(), items=items, cards=cards}))
end
mod:AddCallback(ModCallbacks.MC_POST_GAME_STARTED, function(_, continued)
    active, finished, lastWrite, sequence = true, false, -1000, 0
    run = tostring(Game():GetSeeds():GetStartSeed()) .. ":" .. tostring(Isaac.GetTime())
    snapshot("running")
end)
mod:AddCallback(ModCallbacks.MC_POST_RENDER, function()
    if not active then return end
    local now = Isaac.GetTime()
    if now - lastWrite < 1000 then return end
    lastWrite = now
    snapshot(finished and "ended" or (Game():IsPaused() and "paused" or "running"))
end)
mod:AddCallback(ModCallbacks.MC_POST_GAME_END, function()
    if active then finished = true; snapshot("ended") end
end)
mod:AddCallback(ModCallbacks.MC_PRE_GAME_EXIT, function()
    if active then snapshot("menu") end
    active = false
end)
