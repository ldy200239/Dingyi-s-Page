/* Site content. Every visible string has an English and a Chinese version. */
window.SITE = {
  name: "Dingyi Li",
  email: "ldyxy20000389@gmail.com",
  links: {
    itch: "https://ldy20020389.itch.io/ember-protocol",
    github: "https://github.com/ldy200239"
  },
  intro: {
    en: "Game designer working on levels, systems and interactive media.",
    zh: "游戏设计师，做关卡、系统和互动影像。"
  },
  about: {
    en: "I design levels and systems, and I care about what they make players feel. My work moves between game engines, real-time film and interface design.",
    zh: "我做关卡和系统，也在意它们让玩家感受到什么。我的作品横跨游戏引擎、实时影像和界面设计。"
  },
  tools: ["Godot", "Unity / C#", "Unreal Engine 5", "Cinema 4D", "TouchDesigner", "Figma", "ProtoPie"],

  projects: [
    {
      id: "ember-protocol",
      title: "Ember Protocol",
      native: "余烬协议",
      accent: "#f2a33a",
      kind: { en: "Pixel action roguelite", zh: "像素动作 Roguelite" },
      line: {
        en: "Fight down through the city, bring parts home, and rebuild the shelter.",
        zh: "一层层往下打，带回零件，把避难所一点点修回来。"
      },
      meta: [
        { k: { en: "Role", zh: "职责" }, v: { en: "Game design & development", zh: "游戏设计与开发" } },
        { k: { en: "Team", zh: "团队" }, v: { en: "Lee & Henry", zh: "Lee 与 Henry" } },
        { k: { en: "Engine", zh: "引擎" }, v: { en: "Godot 4", zh: "Godot 4" } },
        { k: { en: "Status", zh: "状态" }, v: { en: "Free demo on itch.io", zh: "itch.io 免费试玩" } }
      ],
      cover: "assets/ember/shots/02_title_full_save.webp",
      pixel: "assets/ember/shots/02_title_full_save.webp",
      peek: ["assets/ember/shots/10_title_sluice_glory.webp", "assets/ember/skills/mooncut_3_iai_moon.webp", "assets/ember/shots/03_hearth_floor.webp"]
    },
    {
      id: "gemini-afterlife",
      title: "Gemini AfterLife",
      native: null,
      accent: "#5aa8ff",
      kind: { en: "3D puzzle-combat game", zh: "3D 解谜战斗游戏" },
      line: {
        en: "One player, two brothers. Anchor Adam, then launch his ghost brother Steve.",
        zh: "一个玩家，两兄弟：先锚定亚当，再把幽灵弟弟史蒂夫发射出去。"
      },
      meta: [
        { k: { en: "Role", zh: "职责" }, v: { en: "Project manager, game design lead", zh: "项目经理、游戏设计主导" } },
        { k: { en: "Team", zh: "团队" }, v: { en: "Kosima Productions", zh: "Kosima Productions" } },
        { k: { en: "Engine", zh: "引擎" }, v: { en: "Unity, C#", zh: "Unity、C#" } },
        { k: { en: "Course", zh: "课程" }, v: { en: "SFU IAT 410", zh: "SFU IAT 410" } }
      ],
      cover: "assets/gemini/card.webp",
      pixel: "assets/gemini/card.webp",
      peek: ["assets/gemini/cover.webp", "assets/gemini/launch.webp", "assets/gemini/boss.webp"]
    },
    {
      id: "can-world",
      title: "Can World",
      native: null,
      accent: "#ff7a59",
      kind: { en: "Speculative animated film", zh: "思辨动画影像" },
      line: {
        en: "A film about how canned, fast entertainment reshapes children's attention.",
        zh: "关于“罐头式”快节奏娱乐如何重塑孩子注意力的影像。"
      },
      meta: [
        { k: { en: "Role", zh: "职责" }, v: { en: "Solo: direction, 3D, VFX, edit", zh: "独立完成：导演、3D、特效、剪辑" } },
        { k: { en: "Tools", zh: "工具" }, v: { en: "UE5, Cinema 4D, TouchDesigner, DaVinci", zh: "UE5、Cinema 4D、TouchDesigner、DaVinci" } }
      ],
      cover: "assets/canworld/card.webp",
      pixel: "assets/canworld/card.webp",
      peek: ["assets/canworld/ending.webp", "assets/canworld/scene2.webp", "assets/canworld/scene1.webp"]
    },
    {
      id: "blind-loop",
      title: "Blind Loop",
      native: null,
      accent: "#ff3355",
      kind: { en: "Experimental film", zh: "实验短片" },
      line: {
        en: "Anticipation, thrill, emptiness, and back again: the loop of reward-driven media.",
        zh: "期待、刺激、空虚，然后重来：奖励机制制造的情绪循环。"
      },
      meta: [
        { k: { en: "Role", zh: "职责" }, v: { en: "Solo: concept, 3D, point clouds, edit", zh: "独立完成：概念、3D、点云、剪辑" } },
        { k: { en: "Tools", zh: "工具" }, v: { en: "TouchDesigner, UE5, Cinema 4D, MeshLab", zh: "TouchDesigner、UE5、Cinema 4D、MeshLab" } }
      ],
      cover: "assets/blindloop/scene_full.webp",
      pixel: "assets/blindloop/scene_full.webp",
      peek: ["assets/blindloop/hero.webp", "assets/blindloop/td.webp", "assets/blindloop/c4d.webp"]
    },
    {
      id: "aero-guide",
      title: "Aero Guide",
      native: null,
      accent: "#f5c84b",
      kind: { en: "Voice interface design", zh: "语音交互设计" },
      line: {
        en: "A voice-first airport assistant for travelers whose hands are full.",
        zh: "为双手被行李占满的旅客设计的语音优先机场助手。"
      },
      meta: [
        { k: { en: "Role", zh: "职责" }, v: { en: "Solo: research, UX, UI, prototype", zh: "独立完成：研究、交互、界面、原型" } },
        { k: { en: "Tools", zh: "工具" }, v: { en: "Figma, Framer, ProtoPie", zh: "Figma、Framer、ProtoPie" } }
      ],
      cover: "assets/aero/card.webp",
      pixel: "assets/aero/cover.webp",
      peek: ["assets/aero/hifi.webp", "assets/aero/lofi.webp", "assets/aero/paper.webp"]
    }
  ],

  /* ---------- Ember Protocol ---------- */
  ember: {
    teaser: "assets/ember/teaser.mp4",
    teaserPoster: "assets/ember/teaser_poster.webp",
    trailer: "assets/ember/trailer.mp4",
    trailerPoster: "assets/ember/trailer_poster.webp",
    loop: [
      { clip: "assets/ember/clips/twin_boss", t: { en: "Go down", zh: "下去" }, d: { en: "Fight room by room to the boss gate.", zh: "一个房间一个房间地打到守卫门前。" } },
      { clip: "assets/ember/clips/home_garden", t: { en: "Come home", zh: "回家" }, d: { en: "Spend the parts you carried back.", zh: "把带回来的零件花在家园上。" } }
    ],
    schools: [
      { id: "neon", en: "Neon", zh: "霓虹流", color: "#ff4fd8",
        skills: [["neon_1_afterimages", "Afterimages"], ["neon_2_crash_code", "Crash Code"], ["neon_3_overclock", "Overclock"], ["neon_4_afterimage_blast", "Afterimage Blast"], ["neon_5_disconnect", "Disconnect"]] },
      { id: "mooncut", en: "Mooncut", zh: "斩月流", color: "#ff6b5b",
        skills: [["mooncut_1_floating_blades", "Floating Blades"], ["mooncut_2_moon_scar", "Moon Scar"], ["mooncut_3_iai_moon", "Iai Moon"], ["mooncut_4_ring_dance", "Ring Dance"], ["mooncut_5_hundred_demons", "Hundred Demons"]] },
      { id: "starlight", en: "Starlight", zh: "星辉流", color: "#a9dcff",
        skills: [["starlight_1_twin_lances", "Twin Lances"], ["starlight_2_sanctuary", "Sanctuary"], ["starlight_3_meteor", "Meteor"], ["starlight_4_star_storm", "Star Storm"], ["starlight_5_ten_thousand_lances", "Ten Thousand Lances"]] },
      { id: "steam", en: "Steam", zh: "蒸汽流", color: "#e0914a",
        skills: [["steam_1_steam_hammer", "Steam Hammer"], ["steam_2_steam_curtain", "Steam Curtain"], ["steam_3_gear_storm", "Gear Storm"], ["steam_4_chain_blast", "Chain Blast"], ["steam_5_furnace_overload", "Furnace Overload"]] },
      { id: "legion", en: "Legion", zh: "千机流", color: "#7ee8ff",
        skills: [["legion_1_turret_beams", "Turret Beams"], ["legion_2_shield_array", "Shield Array"], ["legion_3_micro_missiles", "Micro Missiles"], ["legion_4_wide_beam", "Wide Beam"], ["legion_5_full_barrage", "Full Barrage"]] },
      { id: "bombard", en: "Bombard", zh: "镇岳流", color: "#ff8a3d",
        skills: [["bombard_1_twin_cannons", "Twin Cannons"], ["bombard_2_radar", "Radar"], ["bombard_3_emplacement", "Emplacement"], ["bombard_4_incendiary", "Incendiary"], ["bombard_5_avalanche_salvo", "Avalanche Salvo"]] }
    ],
    wonders: [
      { id: "forge", en: "Ember Forge", zh: "余烬熔炉", floor: { en: "Hearth Court", zh: "炉心庭院" } },
      { id: "sluice", en: "Sky Canal Falls Gate", zh: "天渠瀑闸", floor: { en: "Steam Canal Works", zh: "蒸汽渠厂" } },
      { id: "tree", en: "Cloudtop Ancient Tree", zh: "云顶古树", floor: { en: "Cloud Terrace Garden", zh: "云台花园" } }
    ],
    stages: [
      { en: "Ruins", zh: "残骸" }, { en: "Under repair", zh: "修复中" }, { en: "Running", zh: "运转" }, { en: "Glorious", zh: "辉煌" }
    ],
    gallery: [
      ["02_title_full_save", { en: "Title screen of a finished save: the shelter you built is the backdrop", zh: "通关存档的标题画面：背景就是你修好的避难所" }],
      ["03_hearth_floor", { en: "Hearth Court, the first floor of the shelter", zh: "炉心庭院，避难所第一层" }],
      ["14_resident_talk", { en: "Residents remember your last run", zh: "居民会提起你上一次远征" }],
      ["11_facility_reactor", { en: "Facility upgrades", zh: "设施升级" }],
      ["20_tree_assault", { en: "Skill book: one star map per core", zh: "技能书：每个核心一张星图" }],
      ["18_house_hearth", { en: "Your own house, furnished as you progress", zh: "自己的小屋，随进度添置家具" }],
      ["10_title_sluice_glory", { en: "The title camera tours your shelter", zh: "标题镜头在三层之间巡游" }],
      ["15_ledger_quests", { en: "Shelter ledger: quests", zh: "家园手册：委托" }],
      ["22_tree_katana", { en: "Skill book: Odachi core", zh: "技能书：大太刀核心" }],
      ["19_house_garden", { en: "House style: Cloud Garden", zh: "装修风格：云台花园" }],
      ["13_lift", { en: "The lift between floors", zh: "中枢升降梯" }],
      ["12_facility_workshop", { en: "Workshop research", zh: "工坊永久研究" }]
    ]
  },

  /* ---------- Gemini AfterLife ---------- */
  gemini: {
    play: "https://play.unity.com/en/games/6a60a124-a081-439f-a37d-63fce1b940a0/gemini",
    trailer: "ISqhPPd83J4",
    walkthrough: "ai4ttvYUrEw",
    controls: [
      { keys: ["W", "A", "S", "D"], t: { en: "Move Adam", zh: "移动亚当" } },
      { keys: ["Shift"], t: { en: "Anchor Adam in place", zh: "把亚当锚定在原地" } },
      { keys: ["Hold", "Release"], t: { en: "Pull back, then launch Steve", zh: "按住拉弓，松开发射史蒂夫" } }
    ],
    floors: [
      { tag: "1F", shot: "assets/gemini/floor1.webp", map: "assets/gemini/overview1.webp",
        t: { en: "Hub and tutorial", zh: "大厅与教学层" }, d: { en: "The basement door is visible from here, and stays locked.", zh: "从这里就能看见地下室的门，但它一直锁着。" } },
      { tag: "2F", shot: "assets/gemini/floor2.webp", map: "assets/gemini/overview2.webp",
        t: { en: "Wider loops", zh: "更大的回环" }, d: { en: "The basement key is up here, so the player walks back down through known space.", zh: "地下室钥匙在二楼，玩家要带着新目的走回熟悉的空间。" } },
      { tag: "B1", shot: "assets/gemini/basement.webp", map: "assets/gemini/overview3.webp",
        t: { en: "Puzzles only", zh: "纯解谜" }, d: { en: "No enemies. A quiet floor that tests the launch with precision.", zh: "没有敌人，一层安静的楼，专门考验发射的精准度。" } },
      { tag: "Boss", shot: "assets/gemini/boss.webp", map: null,
        t: { en: "The escape", zh: "逃脱" }, d: { en: "No keys, no doors. Only movement and launches under pressure.", zh: "没有钥匙，没有门，只剩移动和压力下的发射。" } }
    ],
    team: [["Dingyi Li", { en: "Project manager, game design lead", zh: "项目经理、游戏设计主导" }], ["Dennis Deng", { en: "Developer", zh: "开发" }], ["Hengyi Li", { en: "Developer", zh: "开发" }]]
  },

  /* ---------- Can World ---------- */
  canworld: {
    film: "0oiU6QK-H5w",
    scenes: [
      { img: "assets/canworld/beginning.webp", t: { en: "Entry", zh: "入口" }, d: { en: "A wireframe corridor resets the viewer.", zh: "线框走廊把观者“重置”。" } },
      { img: "assets/canworld/scene1.webp", t: { en: "Behavioral factory", zh: "行为工厂" }, d: { en: "Figures repeat what the machines teach them.", zh: "人形重复着机器教给它们的动作。" } },
      { img: "assets/canworld/scene2.webp", t: { en: "Canned city", zh: "罐头城市" }, d: { en: "A city stacked out of cans and modules.", zh: "由罐头和模块堆成的城市。" } },
      { img: "assets/canworld/scene3.webp", t: { en: "Fallen", zh: "崩塌" }, d: { en: "Too much input, and shapes dissolve into noise.", zh: "输入过载，形体溶解成噪点。" } },
      { img: "assets/canworld/ending.webp", t: { en: "Logging out", zh: "登出" }, d: { en: "An exit that may not be an exit.", zh: "一个也许并不是出口的出口。" } }
    ],
    process: ["assets/canworld/storyboard.webp", "assets/canworld/workflow.webp"]
  },

  /* ---------- Blind Loop ---------- */
  blindloop: {
    film: "RCb_F64vDoE",
    ring: [
      { img: "assets/blindloop/story3.webp", t: { en: "Anticipation", zh: "期待" } },
      { img: "assets/blindloop/hero.webp", t: { en: "Entering the system", zh: "进入系统" } },
      { img: "assets/blindloop/story2.webp", t: { en: "Reward maze", zh: "奖励迷宫" } },
      { img: "assets/blindloop/story1.webp", t: { en: "Stimulation peak", zh: "刺激巅峰" } },
      { img: "assets/blindloop/scene_full.webp", t: { en: "Collapse into emptiness", zh: "坠入空虚" } },
      { img: "assets/blindloop/td.webp", t: { en: "Self-confrontation", zh: "直面自己" } },
      { img: "assets/blindloop/c4d.webp", t: { en: "One more box", zh: "再开一个" } },
      { img: "assets/blindloop/story4.webp", t: { en: "Restart", zh: "重来" } }
    ],
    process: ["assets/blindloop/ue5.webp", "assets/blindloop/outcome.webp"]
  },

  /* ---------- Aero Guide ---------- */
  aero: {
    film: "BC0syVhA4AY",
    queries: [
      { en: "Where is gate C32?", zh: "C32 登机口在哪？" },
      { en: "How long until boarding?", zh: "还有多久开始登机？" },
      { en: "Find a restroom near me.", zh: "附近有洗手间吗？" },
      { en: "Remind me in five minutes.", zh: "五分钟后提醒我。" }
    ],
    stats: [
      { n: "82%", t: { en: "use airport apps while rushing", zh: "在赶时间时使用机场应用" } },
      { n: "76%", t: { en: "use them while carrying luggage", zh: "在提着行李时使用" } },
      { n: "63%", t: { en: "say voice access would ease anxiety", zh: "认为语音能缓解焦虑" } }
    ]
  }
};
