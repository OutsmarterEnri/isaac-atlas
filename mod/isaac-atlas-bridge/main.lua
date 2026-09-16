-- SPDX-License-Identifier: GPL-3.0-only
-- Writes only this mod's saveX.dat via the game's supported API.
local mod = RegisterMod("Isaac Atlas Bridge", 1)
local json = require("json")
local active, finished, lastWrite, sequence, run = false, false, -1000, 0, ""
local events, pending, seed, eventKeys, observedFlags = {}, {}, 0, {}, {}
local function record(boss, playerType)
    local key = boss .. ":" .. tostring(playerType)
    if eventKeys[key] then return end
    eventKeys[key] = true
    events[#events + 1] = {boss=boss, playerType=playerType, frame=Game().TimeCounter}
end
local function observe()
    local game = Game()
    if game:GetNumPlayers() < 1 then return end
    local playerType = Isaac.GetPlayer(0):GetPlayerType()
    for _, flag in ipairs({{GameStateFlag.STATE_BOSSRUSH_DONE,"Boss Rush"},{GameStateFlag.STATE_BLUEWOMB_DONE,"Hush"}}) do
        local value = game:GetStateFlag(flag[1])
        if value and not observedFlags[flag[1]] then record(flag[2], playerType) end
        observedFlags[flag[1]] = value
    end
    if game:GetRoom():IsClear() then
        for _, event in ipairs(pending) do record(event.boss, event.playerType) end
        pending = {}
    end
end
local function snapshot(state)
    local game = Game()
    if game:GetNumPlayers() < 1 then return end
    observe()
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
    mod:SaveData(json.encode({schema=2, bridgeVersion="1.0.0", state=state, sequence=sequence, run=run,
        frames=math.max(0, game.TimeCounter), playerType=player:GetPlayerType(),
        difficulty=game.Difficulty, stage=game:GetLevel():GetStage(),
        challenge=game.Challenge, custom=game:GetSeeds():IsCustomRun(),
        players=game:GetNumPlayers(), items=items, cards=cards, events=events, seed=seed,
        stageType=game:GetLevel():GetStageType(), bossRushLimit=game.BossRushParTime,
        hushLimit=game.BlueWombParTime, megaDoor=game:GetStateFlag(GameStateFlag.STATE_MEGA_SATAN_DOOR_OPENED),
        motherDoor=game:GetStateFlag(GameStateFlag.STATE_MOTHER_HEART_DOOR_OPENED), ascent=game:GetStateFlag(GameStateFlag.STATE_BACKWARDS_PATH)}))
end
mod:AddCallback(ModCallbacks.MC_POST_GAME_STARTED, function(_, continued)
    active, finished, lastWrite, sequence = true, false, -1000, 0
    seed = Game():GetSeeds():GetStartSeed()
    events, pending, eventKeys, observedFlags = {}, {}, {}, {}
    observedFlags[GameStateFlag.STATE_BOSSRUSH_DONE] = Game():GetStateFlag(GameStateFlag.STATE_BOSSRUSH_DONE)
    observedFlags[GameStateFlag.STATE_BLUEWOMB_DONE] = Game():GetStateFlag(GameStateFlag.STATE_BLUEWOMB_DONE)
    run = tostring(seed) .. ":" .. tostring(Isaac.GetTime())
    if continued and mod:HasData() then
        local ok, previous = pcall(json.decode, mod:LoadData())
        if ok and type(previous)=="table" and previous.schema==2 and previous.seed==seed and type(previous.events)=="table" then
            run = previous.run
            for _, event in ipairs(previous.events) do
                if type(event)=="table" and type(event.boss)=="string" and type(event.playerType)=="number" then record(event.boss,event.playerType) end
            end
        end
    end
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

-- NPC deaths count only after the boss room clears, on the expected floor.
-- Delirium transformations in The Void must not count as normal completion bosses.
mod:AddCallback(ModCallbacks.MC_POST_NPC_DEATH, function(_, npc)
    if not active or Game():GetRoom():GetType() ~= RoomType.ROOM_BOSS then return end
    local stage, kind, boss = Game():GetLevel():GetStage(), npc.Type, nil
    if kind == EntityType.ENTITY_MOM and (stage==6 or stage==7) then boss="Mom"
    elseif kind == EntityType.ENTITY_MOMS_HEART and stage==8 and Game():GetLevel():GetStageType()<4 then boss="Mom's Heart"
    elseif kind == EntityType.ENTITY_ISAAC and stage==10 then boss="Isaac"
    elseif kind == EntityType.ENTITY_ISAAC and stage==11 then boss="???"
    elseif kind == EntityType.ENTITY_SATAN and stage==10 then boss="Satan"
    elseif kind == EntityType.ENTITY_THE_LAMB and stage==11 then boss="The Lamb"
    elseif kind == EntityType.ENTITY_MEGA_SATAN_2 and stage==11 then boss="Mega Satan"
    elseif kind == EntityType.ENTITY_DELIRIUM and stage==12 then boss="Delirium"
    elseif kind == EntityType.ENTITY_MOTHER and stage==8 then boss="Mother"
    elseif kind == EntityType.ENTITY_BEAST and npc.Variant==0 and stage==13 then boss="The Beast"
    elseif kind == EntityType.ENTITY_ULTRA_GREED and ((Game().Difficulty==2 and npc.Variant==0) or (Game().Difficulty==3 and npc.Variant==1)) then
        boss = Game().Difficulty==3 and "Ultra Greedier" or "Ultra Greed"
    end
    if boss then pending[#pending+1]={boss=boss,playerType=Isaac.GetPlayer(0):GetPlayerType()} end
end)
mod:AddCallback(ModCallbacks.MC_POST_NEW_ROOM, function() pending={} end)
mod:AddCallback(ModCallbacks.MC_POST_UPDATE, function() if active then observe() end end)
