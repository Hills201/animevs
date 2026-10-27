import React, { useState, useMemo, Suspense, lazy } from "react";
import { dayNumber } from "./animeFacts.js";
import { gsap, useGSAP, revealOnScroll, parallax, startSmoothScroll, scrollToTop, smoothScrollToTop, prefersReducedMotion } from "./motion.js";
import { SpotlightCard, ShinyText, Magnet, CountUp } from "./reactbits.jsx";

// Code-split: these only download when the player opens them. Versus carries the
// Supabase client; Daily carries the facts database. Home stays small and fast.
const VersusMode = lazy(() => import("./Versus.jsx"));
const DailyGame = lazy(() => import("./DailyGame.jsx"));
// React Bits SplitText pulls in GSAP's ScrollTrigger + SplitText plugins, so it loads on demand (battle screen).
const SplitText = lazy(() => import("./SplitText.jsx"));
// Analytics are non-essential, so they load after the page is idle.
const Analytics = lazy(() => import("@vercel/analytics/react").then((m) => ({ default: m.Analytics })));
const SpeedInsights = lazy(() => import("@vercel/speed-insights/react").then((m) => ({ default: m.SpeedInsights })));

// ─── ROSTER (150) ───────────────────────────────────────────────────────────
const CHARACTERS = [
  { id:"sukuna-jujutsu-kaisen", name:"Sukuna", series:"Jujutsu Kaisen", tier:"SS", cost:11, rating:99, tags:["range","mobility","melee","aura","energy","speed","regen","element","barrier"], role:"captain", ability:{ name:"Malevolent Shrine", type:"clutch", x:10 } },
  { id:"gojo-satoru-jujutsu-kaisen", name:"Gojo Satoru", series:"Jujutsu Kaisen", tier:"SS", cost:11, rating:98, tags:["range","element","melee","aura","speed","energy","stealth","barrier","mobility"], role:"captain", ability:{ name:"Infinity", type:"counter_immune" } },
  { id:"yuta-jujutsu-kaisen", name:"Yuta", series:"Jujutsu Kaisen", tier:"S", cost:9, rating:92, tags:["melee","regen","range","summon","speed","energy","mobility"], role:"damage", ability:{ name:"Fighting Spirit", type:"adaptable", x:4 } },
  { id:"geto-jujutsu-kaisen", name:"Geto", series:"Jujutsu Kaisen", tier:"S", cost:9, rating:90, tags:["heal","energy","transform","regen","range","element","summon"], role:"vice", ability:{ name:"Fighting Spirit", type:"aura_buff", x:4 } },
  { id:"mahito-jujutsu-kaisen", name:"Mahito", series:"Jujutsu Kaisen", tier:"A", cost:6, rating:85, tags:["summon","range","transform","energy","element"], role:"support", ability:{ name:"Ranged Barrage", type:"aura_buff", x:4, role:"damage" } },
  { id:"nanami-jujutsu-kaisen", name:"Nanami", series:"Jujutsu Kaisen", tier:"A", cost:6, rating:85, tags:["barrier","melee","energy","speed","mobility","range"], role:"tank", ability:{ name:"Titanic Frame", type:"role_synergy", x:5, role:"tank" } },
  { id:"hakari-jujutsu-kaisen", name:"Hakari", series:"Jujutsu Kaisen", tier:"S", cost:8, rating:87, tags:["range","melee","barrier","mobility","speed","energy","element"], role:"support", ability:{ name:"Ranged Barrage", type:"role_synergy", x:4, role:"damage" } },
  { id:"megumi-jujutsu-kaisen", name:"Megumi", series:"Jujutsu Kaisen", tier:"A", cost:6, rating:83, tags:["mobility","barrier","melee","range","summon","speed"], role:"support", ability:{ name:"Blinding Speed", type:"role_synergy", x:4, role:"support" } },
  { id:"todo-jujutsu-kaisen", name:"Todo", series:"Jujutsu Kaisen", tier:"A", cost:6, rating:86, tags:["melee","mobility","range","speed","energy"], role:"tank", ability:{ name:"Guard Field", type:"tag_projection", tag:"barrier" } },
  { id:"choso-jujutsu-kaisen", name:"Choso", series:"Jujutsu Kaisen", tier:"A", cost:6, rating:86, tags:["giant","melee","element","speed","range","mobility"], role:"damage", ability:{ name:"Titanic Frame", type:"role_synergy", x:5, role:"tank" } },
  { id:"maki-jujutsu-kaisen", name:"Maki", series:"Jujutsu Kaisen", tier:"S", cost:9, rating:90, tags:["melee","mobility","aura","speed","stealth","energy"], role:"damage", ability:{ name:"Titanic Frame", type:"overwhelm", x:7, role:"support" } },
  { id:"yuji-itadori-jujutsu-kaisen", name:"Yuji Itadori", series:"Jujutsu Kaisen", tier:"A", cost:6, rating:85, tags:["mobility","melee","speed","energy"], role:"tank", ability:{ name:"Blinding Speed", type:"role_synergy", x:4, role:"support" } },
  { id:"nobara-jujutsu-kaisen", name:"Nobara", series:"Jujutsu Kaisen", tier:"C", cost:3, rating:58, tags:["melee","range","mobility"], role:"support2", ability:{ name:"Titanic Frame", type:"role_synergy", x:5, role:"tank" } },
  { id:"hashirama-naruto", name:"Hashirama", series:"Naruto", tier:"SS", cost:10, rating:97, tags:["aura","melee","mobility","range","giant","energy","speed","regen","heal"], role:"captain", ability:{ name:"Wood Dragon", type:"role_synergy", x:8, role:"tank" } },
  { id:"madara-naruto", name:"Madara", series:"Naruto", tier:"SS", cost:11, rating:96, tags:["summon","range","melee","mobility","element","speed","energy","regen","transform"], role:"captain", ability:{ name:"Perfect Susanoo", type:"aura_buff", x:5 } },
  { id:"naruto-naruto", name:"Naruto", series:"Naruto", tier:"SS", cost:11, rating:99, tags:["melee","transform","regen","heal","energy","mobility","range","speed","summon"], role:"captain", ability:{ name:"Sage of Six Paths", type:"role_synergy", x:9, role:"captain" } },
  { id:"obito-naruto", name:"Obito", series:"Naruto", tier:"S", cost:8, rating:90, tags:["summon","range","melee","regen","stealth","energy","element"], role:"support", ability:{ name:"Ranged Barrage", type:"role_synergy", x:4, role:"damage" } },
  { id:"minato-naruto", name:"Minato", series:"Naruto", tier:"S", cost:8, rating:89, tags:["range","speed","melee","mobility","energy","element","aura"], role:"support", ability:{ name:"Ranged Barrage", type:"role_synergy", x:4, role:"damage" } },
  { id:"jiraiya-naruto", name:"Jiraiya", series:"Naruto", tier:"A", cost:6, rating:86, tags:["melee","summon","range","energy","element","transform"], role:"tank", ability:{ name:"Titanic Frame", type:"role_synergy", x:5, role:"tank" } },
  { id:"itachi-naruto", name:"Itachi", series:"Naruto", tier:"S", cost:7, rating:90, tags:["mobility","melee","element","transform","energy","speed","aura"], role:"vice", ability:{ name:"Blinding Speed", type:"role_synergy", x:4, role:"support" } },
  { id:"might-guy-naruto", name:"Might Guy", series:"Naruto", tier:"A", cost:6, rating:85, tags:["melee","speed","energy","mobility"], role:"damage", ability:{ name:"Fighting Spirit", type:"overwhelm", x:4 } },
  { id:"pain-naruto", name:"Pain", series:"Naruto", tier:"S", cost:7, rating:88, tags:["melee","range","mobility","summon","element","psychic","regen"], role:"vice", ability:{ name:"Titanic Frame", type:"role_synergy", x:5, role:"tank" } },
  { id:"tsunade-naruto", name:"Tsunade", series:"Naruto", tier:"S", cost:5, rating:90, tags:["melee","mobility","heal","regen","energy","aura","element"], role:"healer", ability:{ name:"Blinding Speed", type:"counter_immune", x:4, role:"healer" } },
  { id:"kakashi-naruto", name:"Kakashi", series:"Naruto", tier:"A", cost:6, rating:85, tags:["melee","range","mobility","element","speed","stealth"], role:"support", ability:{ name:"Guard Field", type:"adaptable", tag:"barrier" } },
  { id:"gaara-naruto", name:"Gaara", series:"Naruto", tier:"A", cost:6, rating:83, tags:["range","barrier","element","energy","summon","transform"], role:"support", ability:{ name:"Guard Field", type:"tag_projection", tag:"barrier" } },
  { id:"beerus-dragon-ball", name:"Beerus", series:"Dragon Ball", tier:"SS", cost:10, rating:97, tags:["melee","range","mobility","energy","speed","aura","element"], role:"captain", ability:{ name:"Hakai", type:"counter_immune" } },
  { id:"goku-dragon-ball", name:"Goku", series:"Dragon Ball", tier:"SS", cost:10, rating:96, tags:["range","element","mobility","melee","aura","speed","energy","transform"], role:"damage", ability:{ name:"Ultra Instinct", type:"clutch", x:8 } },
  { id:"vegeta-dragon-ball", name:"Vegeta", series:"Dragon Ball", tier:"S", cost:9, rating:94, tags:["range","mobility","melee","aura","speed","energy","transform"], role:"tank", ability:{ name:"Final Flash", type:"role_synergy", x:7, role:"damage" } },
  { id:"jiren-dragon-ball", name:"Jiren", series:"Dragon Ball", tier:"S", cost:9, rating:93, tags:["range","aura","melee","mobility","speed","energy","element"], role:"captain", ability:{ name:"Power of Justice", type:"role_synergy", x:8, role:"tank" } },
  { id:"gohan-dragon-ball", name:"Gohan", series:"Dragon Ball", tier:"S", cost:8, rating:90, tags:["range","mobility","melee","transform","energy","speed","aura"], role:"damage", ability:{ name:"Ranged Barrage", type:"role_synergy", x:4, role:"damage" } },
  { id:"broly-dragon-ball", name:"Broly", series:"Dragon Ball", tier:"S", cost:9, rating:91, tags:["melee","transform","range","mobility","speed","aura","energy"], role:"tank", ability:{ name:"Fighting Spirit", type:"overwhelm", x:5 } },
  { id:"cell-dragon-ball", name:"Cell", series:"Dragon Ball", tier:"A", cost:6, rating:84, tags:["range","barrier","melee","energy","transform","speed"], role:"tank", ability:{ name:"Guard Field", type:"tag_projection", tag:"barrier" } },
  { id:"majin-buu-dragon-ball", name:"Majin Buu", series:"Dragon Ball", tier:"A", cost:6, rating:83, tags:["mobility","transform","melee","range","speed","element"], role:"damage", ability:{ name:"Blinding Speed", type:"role_synergy", x:4, role:"support" } },
  { id:"android-18-dragon-ball", name:"Android 18", series:"Dragon Ball", tier:"B", cost:4, rating:71, tags:["melee","barrier","range","speed","energy"], role:"damage", ability:{ name:"Elemental Burst", type:"role_synergy", x:4, role:"damage" } },
  { id:"trunks-dragon-ball", name:"Trunks", series:"Dragon Ball", tier:"B", cost:4, rating:73, tags:["melee","element","transform","range","speed"], role:"damage", ability:{ name:"Elemental Burst", type:"role_synergy", x:4, role:"damage" } },
  { id:"piccolo-dragon-ball", name:"Piccolo", series:"Dragon Ball", tier:"B", cost:5, rating:75, tags:["range","element","melee","speed","aura"], role:"damage", ability:{ name:"Ranged Barrage", type:"role_synergy", x:4, role:"tank" } },
  { id:"muzan-demon-slayer", name:"Muzan", series:"Demon Slayer", tier:"SS", cost:10, rating:98, tags:["aura","melee","mobility","speed","regen","transform","energy","element","barrier"], role:"captain", ability:{ name:"Regeneration", type:"role_synergy", x:6, role:"tank" } },
  { id:"kokushibo-demon-slayer", name:"Kokushibo", series:"Demon Slayer", tier:"S", cost:7, rating:90, tags:["melee","mobility","energy","speed","regen","element","aura"], role:"vice", ability:{ name:"Guard Field", type:"clutch", x:6, tag:"barrier" } },
  { id:"gyomei-demon-slayer", name:"Gyomei", series:"Demon Slayer", tier:"S", cost:7, rating:89, tags:["aura","melee","energy","speed","mobility","element","range"], role:"vice", ability:{ name:"Battle Aura", type:"aura_buff", x:4 } },
  { id:"akaza-demon-slayer", name:"Akaza", series:"Demon Slayer", tier:"S", cost:6, rating:89, tags:["range","melee","mobility","speed","energy","regen","transform"], role:"damage", ability:{ name:"Battle Aura", type:"overwhelm", x:5 } },
  { id:"tengen-demon-slayer", name:"Tengen", series:"Demon Slayer", tier:"B", cost:6, rating:80, tags:["melee","mobility","speed","element"], role:"support", ability:{ name:"Titanic Frame", type:"role_synergy", x:5, role:"tank" } },
  { id:"doma-demon-slayer", name:"Doma", series:"Demon Slayer", tier:"S", cost:8, rating:88, tags:["regen","melee","element","range","mobility","speed","transform"], role:"vice", ability:{ name:"Battle Aura", type:"counter_immune", x:3 } },
  { id:"rengoku-demon-slayer", name:"Rengoku", series:"Demon Slayer", tier:"B", cost:6, rating:80, tags:["melee","element","speed","aura","mobility"], role:"tank", ability:{ name:"Elemental Burst", type:"role_synergy", x:4, role:"damage" } },
  { id:"giyu-demon-slayer", name:"Giyu", series:"Demon Slayer", tier:"A", cost:7, rating:85, tags:["melee","mobility","speed","element","energy"], role:"support", ability:{ name:"Ranged Barrage", type:"role_synergy", x:4, role:"damage" } },
  { id:"shinobu-demon-slayer", name:"Shinobu", series:"Demon Slayer", tier:"B", cost:5, rating:81, tags:["element","melee","heal","mobility","speed"], role:"healer", ability:{ name:"Blinding Speed", type:"role_synergy", x:4, role:"support" } },
  { id:"tanjiro-demon-slayer", name:"Tanjiro", series:"Demon Slayer", tier:"S", cost:8, rating:88, tags:["aura","melee","mobility","energy","speed","element"], role:"captain", ability:{ name:"Battle Aura", type:"aura_buff", x:4 } },
  { id:"zenitsu-demon-slayer", name:"Zenitsu", series:"Demon Slayer", tier:"B", cost:5, rating:80, tags:["melee","mobility","speed","range"], role:"support", ability:{ name:"Fighting Spirit", type:"clutch", x:4 } },
  { id:"inosuke-demon-slayer", name:"Inosuke", series:"Demon Slayer", tier:"B", cost:5, rating:76, tags:["mobility","melee","speed","regen","stealth"], role:"support", ability:{ name:"Blinding Speed", type:"role_synergy", x:4, role:"support" } },
  { id:"meruem-hunter-x-hunter", name:"Meruem", series:"Hunter x Hunter", tier:"SS", cost:10, rating:96, tags:["melee","mobility","speed","energy","aura","barrier"], role:"captain", ability:{ name:"Aura Synthesis", type:"adaptable" } },
  { id:"netero-hunter-x-hunter", name:"Netero", series:"Hunter x Hunter", tier:"SS", cost:9, rating:95, tags:["mobility","melee","range","speed","energy","aura"], role:"captain", ability:{ name:"Zero Hand", type:"clutch", x:7 } },
  { id:"chrollo-hunter-x-hunter", name:"Chrollo", series:"Hunter x Hunter", tier:"S", cost:7, rating:92, tags:["melee","mobility","range","element","speed","energy","aura"], role:"vice", ability:{ name:"Fighting Spirit", type:"overwhelm", x:4 } },
  { id:"feitan-hunter-x-hunter", name:"Feitan", series:"Hunter x Hunter", tier:"S", cost:7, rating:89, tags:["melee","element","stealth","mobility","speed"], role:"damage", ability:{ name:"Elemental Burst", type:"role_synergy", x:4, role:"damage" } },
  { id:"hisoka-hunter-x-hunter", name:"Hisoka", series:"Hunter x Hunter", tier:"A", cost:5, rating:84, tags:["range","element","melee","mobility","aura"], role:"support", ability:{ name:"Bungee Gum", type:"adaptable" } },
  { id:"gon-hunter-x-hunter", name:"Gon", series:"Hunter x Hunter", tier:"S", cost:7, rating:90, tags:["aura","melee","mobility","speed","energy","transform"], role:"vice", ability:{ name:"Jajanken", type:"overwhelm", x:8 } },
  { id:"neferpitou-hunter-x-hunter", name:"Neferpitou", series:"Hunter x Hunter", tier:"S", cost:7, rating:88, tags:["melee","mobility","speed","energy","regen","heal","summon"], role:"support", ability:{ name:"Battle Aura", type:"aura_buff", x:3 } },
  { id:"biscuit-hunter-x-hunter", name:"Biscuit", series:"Hunter x Hunter", tier:"A", cost:5, rating:80, tags:["melee","giant","transform","mobility","speed"], role:"tank", ability:{ name:"Titanic Frame", type:"role_synergy", x:5, role:"tank" } },
  { id:"kurapika-hunter-x-hunter", name:"Kurapika", series:"Hunter x Hunter", tier:"A", cost:5, rating:80, tags:["element","heal","regen","energy","mobility","range"], role:"healer", ability:{ name:"Ranged Barrage", type:"role_synergy", x:4, role:"damage" } },
  { id:"illumi-hunter-x-hunter", name:"Illumi", series:"Hunter x Hunter", tier:"A", cost:5, rating:81, tags:["melee","element","mobility","range","psychic"], role:"support", ability:{ name:"Elemental Burst", type:"role_synergy", x:4, role:"damage" } },
  { id:"killua-hunter-x-hunter", name:"Killua", series:"Hunter x Hunter", tier:"A", cost:5, rating:81, tags:["aura","melee","mobility","speed","energy","element"], role:"support", ability:{ name:"Godspeed", type:"role_synergy", x:7, role:"support" } },
  { id:"aizen-bleach", name:"Aizen", series:"Bleach", tier:"SS", cost:9, rating:96, tags:["barrier","element","range","aura","energy","mobility","speed","stealth"], role:"captain", ability:{ name:"Kyoka Suigetsu", type:"counter_immune" } },
  { id:"yhwach-bleach", name:"Yhwach", series:"Bleach", tier:"SS", cost:9, rating:98, tags:["range","mobility","element","aura","summon","speed","energy","regen"], role:"captain", ability:{ name:"The Almighty", type:"clutch", x:9 } },
  { id:"ichigo-bleach", name:"Ichigo", series:"Bleach", tier:"S", cost:8, rating:94, tags:["range","barrier","mobility","melee","aura","speed","transform"], role:"damage", ability:{ name:"Getsuga Tensho", type:"role_synergy", x:7, role:"damage" } },
  { id:"ulquiorra-bleach", name:"Ulquiorra", series:"Bleach", tier:"A", cost:5, rating:85, tags:["melee","aura","mobility","speed","transform"], role:"support", ability:{ name:"Battle Aura", type:"role_synergy", x:3, role:"damage" } },
  { id:"gremmy-bleach", name:"Gremmy", series:"Bleach", tier:"A", cost:5, rating:83, tags:["range","aura","energy","speed","summon"], role:"support", ability:{ name:"Battle Aura", type:"aura_buff", x:3 } },
  { id:"kenpachi-bleach", name:"Kenpachi", series:"Bleach", tier:"S", cost:7, rating:90, tags:["melee","aura","mobility","speed","energy"], role:"captain", ability:{ name:"Battle Aura", type:"aura_buff", x:3 } },
  { id:"toshiro-bleach", name:"Toshiro", series:"Bleach", tier:"A", cost:5, rating:82, tags:["summon","aura","melee","range","mobility","speed"], role:"captain", ability:{ name:"Battle Aura", type:"aura_buff", x:4 } },
  { id:"yoruichi-bleach", name:"Yoruichi", series:"Bleach", tier:"B", cost:4, rating:75, tags:["range","melee","mobility","speed","stealth"], role:"support", ability:{ name:"Ranged Barrage", type:"role_synergy", x:4, role:"damage" } },
  { id:"byakuya-bleach", name:"Byakuya", series:"Bleach", tier:"A", cost:5, rating:85, tags:["range","melee","mobility","speed","aura","element"], role:"captain", ability:{ name:"Titanic Frame", type:"role_synergy", x:5, role:"damage" } },
  { id:"kisuke-bleach", name:"Kisuke", series:"Bleach", tier:"A", cost:6, rating:84, tags:["speed","stealth","melee","range","mobility","summon"], role:"captain", ability:{ name:"Guard Field", type:"tag_projection", tag:"barrier" } },
  { id:"kaido-one-piece", name:"Kaido", series:"One Piece", tier:"S", cost:8, rating:92, tags:["giant","melee","range","speed","transform","mobility","aura"], role:"captain", ability:{ name:"Strongest Creature", type:"role_synergy", x:9, role:"tank" } },
  { id:"luffy-one-piece", name:"Luffy", series:"One Piece", tier:"SS", cost:11, rating:97, tags:["melee","mobility","transform","range","giant","speed","aura"], role:"captain", ability:{ name:"Gear Five", type:"clutch", x:8 } },
  { id:"shanks-one-piece", name:"Shanks", series:"One Piece", tier:"S", cost:8, rating:91, tags:["melee","aura","range","mobility","speed"], role:"captain", ability:{ name:"Conqueror's Haki", type:"aura_buff", x:6 } },
  { id:"mihawk-one-piece", name:"Mihawk", series:"One Piece", tier:"A", cost:7, rating:85, tags:["melee","range","speed","aura"], role:"damage", ability:{ name:"World's Strongest Swordsman", type:"role_synergy", x:7, role:"damage" } },
  { id:"zoro-one-piece", name:"Zoro", series:"One Piece", tier:"A", cost:6, rating:84, tags:["melee","range","mobility","speed","aura"], role:"damage", ability:{ name:"Elemental Burst", type:"role_synergy", x:4, role:"vice" } },
  { id:"doflamingo-one-piece", name:"Doflamingo", series:"One Piece", tier:"A", cost:5, rating:81, tags:["range","mobility","barrier","melee","speed"], role:"captain", ability:{ name:"Blinding Speed", type:"role_synergy", x:4, role:"support" } },
  { id:"law-one-piece", name:"Law", series:"One Piece", tier:"B", cost:4, rating:76, tags:["range","barrier","melee","speed"], role:"captain", ability:{ name:"Guard Field", type:"tag_projection", tag:"barrier" } },
  { id:"ace-one-piece", name:"Ace", series:"One Piece", tier:"B", cost:4, rating:73, tags:["range","element","mobility","speed","transform"], role:"damage", ability:{ name:"Ranged Barrage", type:"role_synergy", x:4, role:"vice" } },
  { id:"sanji-one-piece", name:"Sanji", series:"One Piece", tier:"A", cost:7, rating:86, tags:["melee","mobility","speed","energy","stealth","regen"], role:"damage", ability:{ name:"Blinding Speed", type:"role_synergy", x:4, role:"support" } },
  { id:"crocodile-one-piece", name:"Crocodile", series:"One Piece", tier:"B", cost:4, rating:75, tags:["range","element","mobility","speed","transform"], role:"damage", ability:{ name:"Ranged Barrage", type:"role_synergy", x:4, role:"captain" } },
  { id:"saitama-one-punch-man", name:"Saitama", series:"One Punch Man", tier:"SS", cost:11, rating:99, tags:["melee","mobility","speed","energy","aura","regen"], role:"damage", ability:{ name:"One Punch", type:"overwhelm", x:12 } },
  { id:"blast-one-punch-man", name:"Blast", series:"One Punch Man", tier:"SS", cost:10, rating:96, tags:["range","mobility","melee","element","energy","speed"], role:"captain", ability:{ name:"Blinding Speed", type:"adaptable", x:4, role:"support" } },
  { id:"boros-one-punch-man", name:"Boros", series:"One Punch Man", tier:"S", cost:8, rating:90, tags:["range","melee","mobility","speed","energy","element","regen"], role:"damage", ability:{ name:"Ranged Barrage", type:"role_synergy", x:4, role:"damage" } },
  { id:"garou-one-punch-man", name:"Garou", series:"One Punch Man", tier:"S", cost:9, rating:92, tags:["melee","element","psychic","speed","energy","mobility","aura"], role:"damage", ability:{ name:"Hunter's Instinct", type:"adaptable" } },
  { id:"tatsumaki-one-punch-man", name:"Tatsumaki", series:"One Punch Man", tier:"S", cost:9, rating:91, tags:["aura","psychic","regen","mobility","energy","element","range"], role:"support", ability:{ name:"Terrible Tornado", type:"aura_buff", x:5 } },
  { id:"genos-one-punch-man", name:"Genos", series:"One Punch Man", tier:"A", cost:6, rating:85, tags:["melee","speed","energy","transform","mobility","range"], role:"tank", ability:{ name:"Titanic Frame", type:"role_synergy", x:5, role:"tank" } },
  { id:"bang-one-punch-man", name:"Bang", series:"One Punch Man", tier:"A", cost:7, rating:86, tags:["melee","mobility","speed","energy"], role:"damage", ability:{ name:"Guard Field", type:"tag_projection", tag:"barrier" } },
  { id:"metal-bat-one-punch-man", name:"Metal Bat", series:"One Punch Man", tier:"B", cost:5, rating:80, tags:["melee","mobility","element","speed"], role:"tank", ability:{ name:"Blinding Speed", type:"role_synergy", x:4, role:"support" } },
  { id:"atomic-samurai-one-punch-man", name:"Atomic Samurai", series:"One Punch Man", tier:"B", cost:5, rating:80, tags:["melee","range","mobility","element","speed"], role:"support", ability:{ name:"Guard Field", type:"tag_projection", tag:"barrier" } },
  { id:"shigaraki-my-hero-academia", name:"Shigaraki", series:"My Hero Academia", tier:"S", cost:7, rating:89, tags:["melee","mobility","range","element","aura","regen"], role:"captain", ability:{ name:"Blinding Speed", type:"aura_buff", x:4, tag:"element", role:"support" } },
  { id:"deku-my-hero-academia", name:"Deku", series:"My Hero Academia", tier:"S", cost:7, rating:89, tags:["mobility","element","melee","range","speed","energy","stealth"], role:"damage", ability:{ name:"One For All", type:"role_synergy", x:6, role:"tank" } },
  { id:"endeavor-my-hero-academia", name:"Endeavor", series:"My Hero Academia", tier:"S", cost:7, rating:88, tags:["melee","range","element","mobility","speed","energy"], role:"captain", ability:{ name:"Guard Field", type:"tag_projection", tag:"barrier" } },
  { id:"bakugo-my-hero-academia", name:"Bakugo", series:"My Hero Academia", tier:"S", cost:7, rating:87, tags:["melee","range","element","aura","speed","energy","mobility"], role:"damage", ability:{ name:"Battle Aura", type:"aura_buff", x:4 } },
  { id:"todoroki-my-hero-academia", name:"Todoroki", series:"My Hero Academia", tier:"A", cost:6, rating:82, tags:["element","range","mobility","speed"], role:"support", ability:{ name:"Half-Cold Half-Hot", type:"tag_projection", tag:"element" } },
  { id:"dabi-my-hero-academia", name:"Dabi", series:"My Hero Academia", tier:"A", cost:5, rating:81, tags:["range","element","mobility"], role:"damage", ability:{ name:"Guard Field", type:"tag_projection", tag:"barrier" } },
  { id:"mirko-my-hero-academia", name:"Mirko", series:"My Hero Academia", tier:"A", cost:4, rating:81, tags:["speed","mobility","melee","aura"], role:"damage", ability:{ name:"Guard Field", type:"rival_bonus", tag:"barrier", universe:"Tokyo Ghoul" } },
  { id:"aizawa-my-hero-academia", name:"Aizawa", series:"My Hero Academia", tier:"B", cost:4, rating:75, tags:["mobility","range","melee","stealth"], role:"support", ability:{ name:"Guard Field", type:"tag_projection", tag:"barrier" } },
  { id:"overhaul-my-hero-academia", name:"Overhaul", series:"My Hero Academia", tier:"B", cost:5, rating:75, tags:["melee","element","range"], role:"damage", ability:{ name:"Elemental Burst", type:"role_synergy", x:2, role:"damage" } },
  { id:"gran-torino-my-hero-academia", name:"Gran Torino", series:"My Hero Academia", tier:"C", cost:3, rating:65, tags:["range","speed","mobility","melee"], role:"support", ability:{ name:"Ranged Barrage", type:"role_synergy", x:3, role:"damage" } },
  { id:"eren-titan-attack-on-titan", name:"Eren (Titan)", series:"Attack on Titan", tier:"S", cost:8, rating:93, tags:["melee","aura","giant","mobility","range","transform","regen"], role:"captain", ability:{ name:"Battle Aura", type:"aura_buff", x:4 } },
  { id:"levi-attack-on-titan", name:"Levi", series:"Attack on Titan", tier:"S", cost:6, rating:86, tags:["melee","mobility","speed","stealth","aura"], role:"vice", ability:{ name:"Humanity's Strongest", type:"role_synergy", x:7, role:"damage" } },
  { id:"zeke-attack-on-titan", name:"Zeke", series:"Attack on Titan", tier:"A", cost:4, rating:81, tags:["range","giant","regen","transform"], role:"vice", ability:{ name:"Guard Field", type:"tag_projection", tag:"barrier" } },
  { id:"reiner-titan-attack-on-titan", name:"Reiner (Titan)", series:"Attack on Titan", tier:"A", cost:4, rating:81, tags:["range","mobility","transform","regen","giant"], role:"tank", ability:{ name:"Blinding Speed", type:"role_synergy", x:4, role:"tank" } },
  { id:"mikasa-attack-on-titan", name:"Mikasa", series:"Attack on Titan", tier:"B", cost:3, rating:77, tags:["melee","speed","stealth","range","mobility"], role:"damage", ability:{ name:"Fighting Spirit", type:"overwhelm", x:4 } },
  { id:"armin-attack-on-titan", name:"Armin", series:"Attack on Titan", tier:"A", cost:4, rating:84, tags:["melee","giant","range","regen","transform"], role:"tank", ability:{ name:"Elemental Burst", type:"role_synergy", x:4, role:"damage" } },
  { id:"jean-attack-on-titan", name:"Jean", series:"Attack on Titan", tier:"C", cost:2, rating:62, tags:["mobility","range","melee","stealth"], role:"support", ability:{ name:"Blinding Speed", type:"role_synergy", x:4, role:"support" } },
  { id:"erwin-attack-on-titan", name:"Erwin", series:"Attack on Titan", tier:"C", cost:2, rating:60, tags:["aura","melee","mobility","stealth"], role:"captain", ability:{ name:"Battle Aura", type:"aura_buff", x:3 } },
  { id:"historia-attack-on-titan", name:"Historia", series:"Attack on Titan", tier:"C", cost:2, rating:50, tags:["mobility","melee","stealth"], role:"support", ability:{ name:"Blinding Speed", type:"role_synergy", x:4, role:"support" } },
  { id:"father-fullmetal-alchemist", name:"Father", series:"Fullmetal Alchemist", tier:"SS", cost:10, rating:98, tags:["aura","melee","range","mobility","element","energy","speed","psychic","regen"], role:"captain", ability:{ name:"Battle Aura", type:"overwhelm", x:4 } },
  { id:"king-bradley-fullmetal-alchemist", name:"King Bradley", series:"Fullmetal Alchemist", tier:"S", cost:8, rating:89, tags:["melee","aura","range","speed","regen","mobility"], role:"captain", ability:{ name:"Battle Aura", type:"aura_buff", x:4 } },
  { id:"edward-elric-fullmetal-alchemist", name:"Edward Elric", series:"Fullmetal Alchemist", tier:"S", cost:7, rating:88, tags:["element","melee","mobility","speed","energy"], role:"vice", ability:{ name:"Ranged Barrage", type:"role_synergy", x:4, role:"damage" } },
  { id:"scar-fullmetal-alchemist", name:"Scar", series:"Fullmetal Alchemist", tier:"A", cost:6, rating:86, tags:["element","mobility","melee","energy","speed","stealth"], role:"damage", ability:{ name:"Titanic Frame", type:"counter_immune", x:5, role:"tank" } },
  { id:"olivier-fullmetal-alchemist", name:"Olivier", series:"Fullmetal Alchemist", tier:"C", cost:2, rating:61, tags:["melee","mobility"], role:"support", ability:{ name:"Battle Aura", type:"aura_buff", x:3 } },
  { id:"roy-mustang-fullmetal-alchemist", name:"Roy Mustang", series:"Fullmetal Alchemist", tier:"S", cost:7, rating:87, tags:["element","range","aura","energy","transform"], role:"vice", ability:{ name:"Blinding Speed", type:"overwhelm", x:4, role:"support" } },
  { id:"greed-fullmetal-alchemist", name:"Greed", series:"Fullmetal Alchemist", tier:"B", cost:4, rating:72, tags:["melee","mobility","speed"], role:"support", ability:{ name:"Blinding Speed", type:"role_synergy", x:4, role:"support" } },
  { id:"alphonse-fullmetal-alchemist", name:"Alphonse", series:"Fullmetal Alchemist", tier:"B", cost:5, rating:81, tags:["giant","melee","energy","element"], role:"tank", ability:{ name:"Titanic Frame", type:"role_synergy", x:5, role:"tank" } },
  { id:"zagred-black-clover", name:"Zagred", series:"Black Clover", tier:"A", cost:7, rating:85, tags:["mobility","barrier","speed","element","energy","regen"], role:"damage", ability:{ name:"Blinding Speed", type:"role_synergy", x:4, role:"tank" } },
  { id:"yami-black-clover", name:"Yami", series:"Black Clover", tier:"S", cost:7, rating:88, tags:["aura","melee","range","mobility","energy","element","speed"], role:"captain", ability:{ name:"Battle Aura", type:"aura_buff", x:4 } },
  { id:"mereoleona-black-clover", name:"Mereoleona", series:"Black Clover", tier:"A", cost:7, rating:87, tags:["mobility","element","melee","aura","speed","energy"], role:"tank", ability:{ name:"Blinding Speed", type:"adaptable", x:4, role:"support" } },
  { id:"asta-black-clover", name:"Asta", series:"Black Clover", tier:"SS", cost:10, rating:96, tags:["range","melee","mobility","speed","element","transform","energy"], role:"damage", ability:{ name:"Ranged Barrage", type:"role_synergy", x:4, role:"vice" } },
  { id:"yuno-black-clover", name:"Yuno", series:"Black Clover", tier:"SS", cost:9, rating:94, tags:["summon","range","melee","mobility","element","speed","energy","transform"], role:"captain", ability:{ name:"Ranged Barrage", type:"role_synergy", x:4, role:"damage" } },
  { id:"noelle-black-clover", name:"Noelle", series:"Black Clover", tier:"S", cost:7, rating:89, tags:["mobility","element","transform","speed","range","giant","melee"], role:"support", ability:{ name:"Blinding Speed", type:"role_synergy", x:4, role:"damage" } },
  { id:"nozel-black-clover", name:"Nozel", series:"Black Clover", tier:"C", cost:3, rating:66, tags:["element","range"], role:"support", ability:{ name:"Titanic Frame", type:"role_synergy", x:5, role:"support" } },
  { id:"julius-black-clover", name:"Julius", series:"Black Clover", tier:"SS", cost:11, rating:99, tags:["regen","heal","speed","range","mobility","summon","energy","element","barrier"], role:"captain", ability:{ name:"Titanic Frame", type:"clutch", x:10, role:"tank" } },
  { id:"makima-chainsaw-man", name:"Makima", series:"Chainsaw Man", tier:"S", cost:9, rating:92, tags:["range","psychic","summon","regen","aura","stealth","energy"], role:"captain", ability:{ name:"Fighting Spirit", type:"overwhelm", x:4 } },
  { id:"kishibe-chainsaw-man", name:"Kishibe", series:"Chainsaw Man", tier:"A", cost:6, rating:85, tags:["melee","speed","mobility","range","stealth"], role:"damage", ability:{ name:"Elemental Burst", type:"role_synergy", x:4, role:"damage" } },
  { id:"denji-chainsaw-man", name:"Chainsaw Man (Denji)", series:"Chainsaw Man", tier:"A", cost:7, rating:87, tags:["transform","regen","speed","mobility","melee","range"], role:"damage", ability:{ name:"Battle Aura", type:"aura_buff", x:3 } },
  { id:"katana-man-chainsaw-man", name:"Katana Man", series:"Chainsaw Man", tier:"B", cost:4, rating:76, tags:["melee","speed","regen","transform","mobility"], role:"damage", ability:{ name:"Elemental Burst", type:"role_synergy", x:4, role:"damage" } },
  { id:"aki-chainsaw-man", name:"Aki", series:"Chainsaw Man", tier:"C", cost:3, rating:70, tags:["melee","range","summon","mobility"], role:"support", ability:{ name:"Fighting Spirit", type:"aura_buff", x:4 } },
  { id:"power-chainsaw-man", name:"Power", series:"Chainsaw Man", tier:"C", cost:3, rating:70, tags:["range","melee","mobility","regen"], role:"support2", ability:{ name:"Ranged Barrage", type:"adaptable", x:4, role:"damage" } },
  { id:"reze-chainsaw-man", name:"Reze", series:"Chainsaw Man", tier:"B", cost:5, rating:80, tags:["range","melee","mobility","speed","energy"], role:"damage", ability:{ name:"Guard Field", type:"rival_bonus", tag:"barrier", universe:"Chainsaw Man" } },
  { id:"beam-chainsaw-man", name:"Beam", series:"Chainsaw Man", tier:"C", cost:2, rating:58, tags:["mobility","melee","stealth","transform"], role:"support", ability:{ name:"Ranged Barrage", type:"role_synergy", x:4, role:"support2" } },
  { id:"zeref-fairy-tail", name:"Zeref", series:"Fairy Tail", tier:"SS", cost:9, rating:96, tags:["aura","barrier","heal","range","element","summon","energy","stealth","regen"], role:"captain", ability:{ name:"Guard Field", type:"tag_projection", tag:"barrier" } },
  { id:"gildarts-fairy-tail", name:"Gildarts", series:"Fairy Tail", tier:"A", cost:6, rating:85, tags:["melee","aura","energy","element"], role:"damage", ability:{ name:"Guard Field", type:"aura_buff", x:6, tag:"barrier" } },
  { id:"natsu-fairy-tail", name:"Natsu", series:"Fairy Tail", tier:"S", cost:8, rating:89, tags:["melee","mobility","aura","speed","energy","element","range"], role:"damage", ability:{ name:"Titanic Frame", type:"role_synergy", x:5, role:"tank" } },
  { id:"mavis-fairy-tail", name:"Mavis", series:"Fairy Tail", tier:"S", cost:7, rating:88, tags:["range","element","heal","barrier","aura","energy","regen"], role:"healer", ability:{ name:"Ranged Barrage", type:"role_synergy", x:8, role:"healer" } },
  { id:"laxus-fairy-tail", name:"Laxus", series:"Fairy Tail", tier:"B", cost:5, rating:81, tags:["melee","aura","range","element"], role:"support", ability:{ name:"Battle Aura", type:"role_synergy", x:3, role:"damage" } },
  { id:"erza-fairy-tail", name:"Erza", series:"Fairy Tail", tier:"A", cost:7, rating:87, tags:["melee","range","mobility","speed","regen","aura"], role:"damage", ability:{ name:"Fighting Spirit", type:"clutch", x:7 } },
  { id:"gray-fairy-tail", name:"Gray", series:"Fairy Tail", tier:"B", cost:5, rating:80, tags:["range","element","melee","mobility","energy"], role:"tank", ability:{ name:"Ranged Barrage", type:"tag_projection", tag:"barrier" } },
  { id:"jellal-fairy-tail", name:"Jellal", series:"Fairy Tail", tier:"C", cost:5, rating:70, tags:["range","barrier"], role:"captain", ability:{ name:"Guard Field", type:"tag_projection", tag:"barrier" } },
  { id:"escanor-seven-deadly-sins", name:"Escanor", series:"Seven Deadly Sins", tier:"SS", cost:10, rating:98, tags:["melee","range","aura","element","energy","regen","mobility","transform","giant"], role:"tank", ability:{ name:"The One", type:"clutch", x:12 } },
  { id:"meliodas-seven-deadly-sins", name:"Meliodas", series:"Seven Deadly Sins", tier:"SS", cost:10, rating:98, tags:["range","melee","speed","transform","element","mobility","stealth","energy"], role:"captain", ability:{ name:"Full Counter", type:"counter_immune" } },
  { id:"estarossa-seven-deadly-sins", name:"Estarossa", series:"Seven Deadly Sins", tier:"S", cost:8, rating:91, tags:["range","melee","energy","element","mobility"], role:"vice", ability:{ name:"Ranged Barrage", type:"role_synergy", x:4, role:"vice" } },
  { id:"zeldris-seven-deadly-sins", name:"Zeldris", series:"Seven Deadly Sins", tier:"SS", cost:9, rating:95, tags:["range","melee","mobility","element","speed","energy"], role:"captain", ability:{ name:"Ranged Barrage", type:"clutch", x:4, role:"support" } },
  { id:"ban-seven-deadly-sins", name:"Ban", series:"Seven Deadly Sins", tier:"A", cost:7, rating:87, tags:["aura","regen","melee","mobility","energy","speed"], role:"damage", ability:{ name:"Battle Aura", type:"role_synergy", x:3, role:"damage" } },
  { id:"merlin-seven-deadly-sins", name:"Merlin", series:"Seven Deadly Sins", tier:"B", cost:6, rating:82, tags:["barrier","element","heal","transform","energy"], role:"healer", ability:{ name:"Guard Field", type:"tag_projection", tag:"barrier" } },
  { id:"gowther-seven-deadly-sins", name:"Gowther", series:"Seven Deadly Sins", tier:"B", cost:6, rating:80, tags:["range","element","stealth","speed","psychic"], role:"support", ability:{ name:"Elemental Burst", type:"role_synergy", x:4, role:"damage" } },
  { id:"sasuke-naruto", name:"Sasuke", series:"Naruto", tier:"SS", cost:10, rating:97, tags:["melee","element","range","speed","mobility","aura","summon","energy","transform"], role:"damage", ability:{ name:"Amaterasu", type:"role_synergy", x:8, role:"damage" } },
  { id:"orochimaru-naruto", name:"Orochimaru", series:"Naruto", tier:"S", cost:7, rating:88, tags:["summon","regen","stealth","melee","transform","psychic","mobility"], role:"support", ability:{ name:"Immortality", type:"clutch", x:7 } },
  { id:"sakura-naruto", name:"Sakura", series:"Naruto", tier:"B", cost:4, rating:78, tags:["heal","melee","aura","summon","energy"], role:"healer", ability:{ name:"Byakugo Seal", type:"role_synergy", x:6, role:"healer" } },
  { id:"yamamoto-bleach", name:"Yamamoto", series:"Bleach", tier:"SS", cost:10, rating:96, tags:["element","aura","melee","energy","range","barrier","speed","mobility","transform"], role:"captain", ability:{ name:"Zanka no Tachi", type:"overwhelm", x:8 } },
  { id:"renji-bleach", name:"Renji", series:"Bleach", tier:"A", cost:6, rating:84, tags:["melee","range","energy","speed","transform","aura"], role:"damage", ability:{ name:"Bankai: Zabimaru", type:"role_synergy", x:5, role:"vice" } },
  { id:"orihime-bleach", name:"Orihime", series:"Bleach", tier:"C", cost:3, rating:68, tags:["heal","barrier","regen","summon"], role:"healer", ability:{ name:"Rejection of Fate", type:"role_synergy", x:7, role:"healer" } },
  { id:"roger-one-piece", name:"Gol D. Roger", series:"One Piece", tier:"SS", cost:11, rating:98, tags:["melee","aura","range","speed","mobility","energy","element","transform","barrier"], role:"captain", ability:{ name:"King of the Pirates", type:"aura_buff", x:7 } },
  { id:"whitebeard-one-piece", name:"Whitebeard", series:"One Piece", tier:"SS", cost:10, rating:96, tags:["giant","melee","barrier","aura","element","range","energy","mobility","speed"], role:"tank", ability:{ name:"Tremor-Tremor Fruit", type:"role_synergy", x:9, role:"tank" } },
  { id:"kaneki-tokyo-ghoul", name:"Kaneki", series:"Tokyo Ghoul", tier:"A", cost:7, rating:84, tags:["mobility","melee","range","speed","regen","transform"], role:"damage", ability:{ name:"Blinding Speed", type:"role_synergy", x:4, role:"captain" } },
  { id:"touka-tokyo-ghoul", name:"Touka", series:"Tokyo Ghoul", tier:"B", cost:3, rating:74, tags:["melee","mobility","stealth","speed"], role:"support", ability:{ name:"Fighting Spirit", type:"adaptable", x:4 } },
];
// CHARACTERS is mutable so the in-app editor can tune values for the session.
const byId = (id) => CHARACTERS.find((c) => c.id === id);
const ALL_TAGS = ["melee","range","mobility","barrier","element","giant","aura","summon","speed","energy","stealth","psychic","regen","transform","heal"];
// Max tags a character may hold, by tier (higher tier = more versatile).
const TIER_TAG_CAP = { SS:9, S:7, A:6, B:5, C:4 };
const tagCapFor = (tier) => TIER_TAG_CAP[tier] || 4;
const ABILITY_TYPE_LIST = ["role_synergy","counter_immune","tag_projection","rival_bonus","adaptable","clutch","aura_buff","overwhelm"];

// ─── LADDER (10 rungs) ─────────────────────────────────────────────────────
const LADDER = [
  { rung:1, title:"The Hashira", universe:"Demon Slayer", team:["muzan-demon-slayer","kokushibo-demon-slayer","gyomei-demon-slayer","akaza-demon-slayer","tanjiro-demon-slayer","giyu-demon-slayer","shinobu-demon-slayer"], boost:0.714 },
  { rung:2, title:"Hero Association", universe:"One Punch Man", team:["saitama-one-punch-man","blast-one-punch-man","garou-one-punch-man","tatsumaki-one-punch-man","boros-one-punch-man","bang-one-punch-man","genos-one-punch-man"], boost:0.749 },
  { rung:3, title:"Magic Knights", universe:"Black Clover", team:["julius-black-clover","asta-black-clover","yuno-black-clover","noelle-black-clover","yami-black-clover","mereoleona-black-clover","zagred-black-clover"], boost:0.785 },
  { rung:4, title:"The Sins", universe:"Seven Deadly Sins", team:["escanor-seven-deadly-sins","meliodas-seven-deadly-sins","zeldris-seven-deadly-sins","estarossa-seven-deadly-sins","ban-seven-deadly-sins","merlin-seven-deadly-sins","gowther-seven-deadly-sins"], boost:0.815 },
  { rung:5, title:"The Nen Masters", universe:"Hunter x Hunter", team:["meruem-hunter-x-hunter","netero-hunter-x-hunter","chrollo-hunter-x-hunter","gon-hunter-x-hunter","feitan-hunter-x-hunter","neferpitou-hunter-x-hunter","hisoka-hunter-x-hunter"], boost:0.84 },
  { rung:6, title:"Cursed Elite", universe:"Jujutsu Kaisen", team:["sukuna-jujutsu-kaisen","gojo-satoru-jujutsu-kaisen","yuta-jujutsu-kaisen","geto-jujutsu-kaisen","maki-jujutsu-kaisen","hakari-jujutsu-kaisen","todo-jujutsu-kaisen"], boost:0.881 },
  { rung:7, title:"Soul Society", universe:"Bleach", team:["yhwach-bleach","aizen-bleach","ichigo-bleach","kenpachi-bleach","ulquiorra-bleach","byakuya-bleach","kisuke-bleach"], boost:0.916 },
  { rung:8, title:"Leaf Legends", universe:"Naruto", team:["naruto-naruto","hashirama-naruto","madara-naruto","obito-naruto","itachi-naruto","tsunade-naruto","minato-naruto"], boost:0.932 },
  { rung:9, title:"The Yonko", universe:"One Piece", team:["luffy-one-piece","kaido-one-piece","shanks-one-piece","sanji-one-piece","mihawk-one-piece","zoro-one-piece","doflamingo-one-piece"], boost:1.012 },
  { rung:10, title:"Gods of Destruction", universe:"Dragon Ball", team:["beerus-dragon-ball","goku-dragon-ball","vegeta-dragon-ball","jiren-dragon-ball","broly-dragon-ball","gohan-dragon-ball","cell-dragon-ball"], boost:1.012 },
];

// ─── ROLES ─────────────────────────────────────────────────────────────────
// Each role "wants" certain tags. A character that fits its role gains a bonus;
// a poor fit takes a penalty. This is the draft-good-characters-into-good-roles layer.
const ROLES = [
  { id:"captain",  name:"Captain",      blurb:"Raw power",   wants:["melee","aura","range"],       color:"#ffb020" },
  { id:"vice",     name:"Vice-Captain", blurb:"Second-in-command", wants:["aura","melee","mobility"], color:"#f97316" },
  { id:"tank",     name:"Tank",         blurb:"Durability",  wants:["giant","barrier","melee"],    color:"#3b82f6" },
  { id:"damage",   name:"Damage",       blurb:"Offense",     wants:["range","element","melee"],    color:"#ef4444" },
  { id:"support",  name:"Support",      blurb:"Utility",     wants:["summon","mobility","barrier"],color:"#22c55e" },
  { id:"support2", name:"Support II",   blurb:"Utility",     wants:["summon","mobility","element"],color:"#14b8a6" },
  { id:"healer",   name:"Healer",       blurb:"Sustain",     wants:["heal","aura","element","summon"],    color:"#a855f7" },
];
const roleById = (id) => ROLES.find((r) => r.id === id);

// Role-fit: count how many of the character's tags the role wants.
// 2+ matches = perfect (+15 pts), 1 match = decent (+5 pts), 0 = misfit (+0).
// PLUS: if placed in the character's canonical/signature role, an extra +10 pts.
function sameSignatureRole(character, roleId) {
  if (!character?.role) return false;
  if (character.role === roleId) return true;
  // Support and Support II are one signature-role family.
  return (character.role === "support" && roleId === "support2") || (character.role === "support2" && roleId === "support");
}
function roleFit(character, roleId) {
  const role = roleById(roleId);
  if (!character || !role) return { bonus: 0, label: "—", tone: "none", matches: 0, signature: false };
  const matches = character.tags.filter((t) => role.wants.includes(t)).length;
  const signature = sameSignatureRole(character, roleId);
  let base;
  if (matches >= 2) base = { bonus: 15, label: "Perfect fit", tone: "great", matches };
  else if (matches === 1) base = { bonus: 5, label: "Good fit", tone: "good", matches };
  else base = { bonus: 0, label: "Misfit", tone: "bad", matches };
  if (signature) {
    // Signature placement always adds its bonus on top — never punished for a tag mismatch.
    return { ...base, bonus: base.bonus + 10, label: matches >= 2 ? "Perfect fit · Signature" : matches === 1 ? "Good fit · Signature" : "Signature role", tone: matches >= 2 ? "great" : "good", signature: true };
  }
  return { ...base, signature: false };
}
function fittedRating(character, roleId) {
  return Math.round(character.rating + roleFit(character, roleId).bonus);
}
function displayedRating(member, ctx = {}) {
  return fittedRatingWithAbility(member, ctx);
}

const BUDGET = 50;
const PICKS = 7;
const DRAW_SIZE = 5;
const MAX_REROLLS_SPIN = 1;
const MAX_REROLLS_DRAFT = 2;
const MAX_REROLLS = 3; // legacy fallback (unused directly)

// ─── COUNTERS (team-level) ──────────────────────────────────────────────────
const COUNTER_TIERS = {
  situational: { label:"Situational", one:8 },
  core: { label:"Core", one:10 },
  strong: { label:"Strong", one:12 },
};
const COUNTERS = [
  { win:"range", lose:"melee", label:"Range > Melee", tier:"core" },
  { win:"mobility", lose:"range", label:"Mobility > Range", tier:"strong" },
  { win:"melee", lose:"mobility", label:"Melee > Mobility", tier:"core" },
  { win:"barrier", lose:"element", label:"Barrier > Element", tier:"strong" },
  { win:"giant", lose:"melee", label:"Giant > Melee", tier:"situational" },
  { win:"aura", lose:"barrier", label:"Aura > Barrier", tier:"core" },
  { win:"speed", lose:"giant", label:"Speed > Giant", tier:"strong" },
  { win:"energy", lose:"barrier", label:"Energy > Barrier", tier:"core" },
  { win:"stealth", lose:"summon", label:"Stealth > Summon", tier:"situational" },
  { win:"psychic", lose:"speed", label:"Psychic > Speed", tier:"strong" },
  { win:"regen", lose:"element", label:"Regen > Element", tier:"situational" },
  { win:"transform", lose:"stealth", label:"Transform > Stealth", tier:"core" },
  { win:"heal", lose:"regen", label:"Heal > Regen", tier:"situational" },
];
const COUNTER_BONUS = 15; // legacy cap/reference; actual edge rewards are tier + advantage scaled
const tagCount = (team, tag) => team.reduce((n, c) => n + (Array.isArray(c?.tags) && c.tags.includes(tag) ? 1 : 0), 0);

function counterReward(edge, advantage) {
  const cfg = COUNTER_TIERS[edge.tier] || COUNTER_TIERS.core;
  // One tag of advantage starts modestly; stacking the same advantage increases
  // the reward, capped at +20 so a single matchup can never dominate a rung.
  return Math.min(20, cfg.one + Math.max(0, advantage - 1) * 5);
}

function projectCounterTags(team) {
  return team.flatMap((m) => {
    const ab = m?.character?.ability;
    return ab?.type === "tag_projection" && ab.tag ? [ab.tag] : [];
  });
}

function counterEdgesFor(myTeam, oppChars) {
  const clean = myTeam.filter(Boolean);
  const chars = clean.map((m) => m.character);
  const projected = projectCounterTags(clean);
  const countWith = (tag) => tagCount(chars, tag) + projected.filter((t) => t === tag).length;
  const edges = [];
  for (const ctr of COUNTERS) {
    const winCount = countWith(ctr.win);
    const loseCount = tagCount(oppChars, ctr.lose);
    const advantage = winCount - loseCount;
    if (winCount > 0 && advantage > 0) {
      edges.push({ ...ctr, advantage, bonus: counterReward(ctr, advantage) });
    }
  }
  return edges.sort((a,b) => b.bonus - a.bonus || b.advantage - a.advantage);
}

function applyStrongestCounterImmunity(score) {
  if (!score.hasImmunity || score.edgeDetails.length === 0) return score;
  const blocked = score.edgeDetails[0];
  const nextDetails = score.edgeDetails.slice(1);
  return {
    ...score,
    total: score.total - blocked.bonus,   // duoBonus is untouched — immunity blocks counters, not synergy
    bonus: score.bonus - blocked.bonus,
    edgeDetails: nextDetails,
    edges: nextDetails.map((e) => e.label),
    immunityUsed: blocked,
  };
}

// ─── ABILITIES ──────────────────────────────────────────────────────────────
// Effect types and how each reads. Effects hook into rating/counter/role math.
const ABILITY_INFO = {
  role_synergy:   (a) => `+${a.x} rating as ${roleById(a.role)?.name || a.role}`,
  counter_immune: ()  => `Blocks the strongest enemy counter`,
  tag_projection: (a) => `Counts as ${a.tag} for counters`,
  rival_bonus:    (a) => `+${a.x} team vs ${a.universe}`,
  adaptable:      ()  => `Always earns at least a Good Fit bonus`,
  clutch:         (a) => `+${a.x} rating on rungs 6-10`,
  aura_buff:      (a) => `+${a.x} to neighboring roles`,
  overwhelm:      (a) => `+${a.x} if your highest-rated fighter`,
};
function abilityText(ab) {
  if (!ab) return "";
  const fn = ABILITY_INFO[ab.type];
  return fn ? fn(ab) : "";
}

// Role-fit with ability awareness (adaptable ignores misfit).
function fittedRatingWithAbility(member, ctx) {
  const { character, roleId } = member;
  let fit = roleFit(character, roleId);
  const ab = character.ability;
  // adaptable: guarantees at least a "Good fit" bonus, even on a tag misfit.
  if (ab && ab.type === "adaptable" && fit.bonus < 5) fit = { ...fit, bonus: fit.signature ? fit.bonus + 5 : 5, label: fit.signature ? "Signature · Adaptable" : "Adaptable", tone: "good" };
  let r = character.rating + fit.bonus;
  if (!ab) return Math.round(r);
  const ax = ab.x || 0; // guard: a missing bonus value must never poison the total
  // role_synergy
  if (ab.type === "role_synergy" && ab.role === roleId) r += ax;
  // clutch: only on hard rungs (R6-R10). Normalize the rung so an unexpected
  // string/object value can never accidentally activate the bonus early.
  const rungNumber = Number(ctx?.rungNumber);
  const isHardRung = Number.isFinite(rungNumber) && rungNumber >= 6 && rungNumber <= 10;
  if (ab.type === "clutch" && isHardRung) r += ax;
  // overwhelm: if this is the team's highest base rating
  if (ab.type === "overwhelm" && ctx && ctx.isHighest) r += ax;
  return Math.round(r);
}

// Which team members are adjacent (for aura_buff). Roles are ordered; neighbors
// are the slots before/after in the ROLES array order.
function auraTargets(team) {
  const order = ROLES.map((r) => r.id);
  const bonusByRole = {};
  team.forEach((m) => {
    if (m && m.character.ability && m.character.ability.type === "aura_buff") {
      const idx = order.indexOf(m.roleId);
      [idx - 1, idx + 1].forEach((n) => {
        if (n >= 0 && n < order.length) {
          const rid = order[n];
          bonusByRole[rid] = (bonusByRole[rid] || 0) + (m.character.ability.x || 0);
        }
      });
    }
  });
  return bonusByRole;
}

// team is array of { character, roleId }. ctx carries rung info for abilities.
// ─── SQUAD SYNERGY (duos) ──────────────────────────────────────────────────
// Certain canonical pairings — family, mentor/student, sworn rivals, lifelong
// partners — pay a flat bonus when BOTH fighters are on your squad. Flat, like
// every other scoring layer, so the breakdown still adds up in a player's head.
//
// Rules of the system:
//   · Both fighters must be on the squad. Role placement doesn't matter.
//   · Every matching pair pays out, so three-character groups (the Shiganshina
//     Trio, the Chainsaw Man flatshare) are listed as their three pairs and
//     stack to +36.
//   · Pairs are always same-series — checked by a guard below.
//   · SOLO LADDER: synergy is the PLAYER'S bonus only. The ladder squads are
//     canon teams stuffed with duos (Goku/Vegeta, Naruto/Minato, Saitama/Genos),
//     and letting them claim it would hand the most points to the hardest rungs
//     while rungs 1, 3, 5 and 7 got nothing. In PvP both sides get synergy,
//     because both sides are players who drafted for it.
const DUO_BONUS = 12;
const DUOS = [
  ["naruto-naruto", "minato-naruto", "Father & Son", "family"],
  ["naruto-naruto", "jiraiya-naruto", "Master & Student", "mentor"],
  ["naruto-naruto", "kakashi-naruto", "Sensei & Student", "mentor"],
  ["naruto-naruto", "gaara-naruto", "Kindred Jinchuriki", "bond"],
  ["kakashi-naruto", "might-guy-naruto", "Eternal Rivals", "rival"],
  ["hashirama-naruto", "madara-naruto", "Rivals of the Valley", "rival"],
  ["itachi-naruto", "obito-naruto", "Akatsuki Cell", "bond"],
  ["jiraiya-naruto", "tsunade-naruto", "Legendary Sannin", "bond"],
  ["minato-naruto", "kakashi-naruto", "Captain & Squad", "mentor"],
  ["goku-dragon-ball", "gohan-dragon-ball", "Father & Son", "family"],
  ["goku-dragon-ball", "vegeta-dragon-ball", "Eternal Rivals", "rival"],
  ["vegeta-dragon-ball", "trunks-dragon-ball", "Father & Son", "family"],
  ["gohan-dragon-ball", "piccolo-dragon-ball", "Mentor & Student", "mentor"],
  ["goku-dragon-ball", "beerus-dragon-ball", "God & Challenger", "rival"],
  ["gojo-satoru-jujutsu-kaisen", "geto-jujutsu-kaisen", "The Strongest Duo", "bond"],
  ["sukuna-jujutsu-kaisen", "yuji-itadori-jujutsu-kaisen", "Vessel & Curse", "bond"],
  ["yuji-itadori-jujutsu-kaisen", "megumi-jujutsu-kaisen", "Sworn Allies", "bond"],
  ["yuji-itadori-jujutsu-kaisen", "nobara-jujutsu-kaisen", "First Years", "bond"],
  ["megumi-jujutsu-kaisen", "nobara-jujutsu-kaisen", "First Years", "bond"],
  ["gojo-satoru-jujutsu-kaisen", "megumi-jujutsu-kaisen", "Teacher & Student", "mentor"],
  ["ichigo-bleach", "kisuke-bleach", "Shopkeeper & Substitute", "mentor"],
  ["ichigo-bleach", "byakuya-bleach", "Clashing Blades", "rival"],
  ["ichigo-bleach", "yoruichi-bleach", "Trainer & Trainee", "mentor"],
  ["aizen-bleach", "yhwach-bleach", "Architects of War", "rival"],
  ["luffy-one-piece", "ace-one-piece", "Sworn Brothers", "family"],
  ["zoro-one-piece", "sanji-one-piece", "Eternal Rivals", "rival"],
  ["luffy-one-piece", "zoro-one-piece", "Captain & First Mate", "bond"],
  ["luffy-one-piece", "shanks-one-piece", "Inherited Will", "mentor"],
  ["zoro-one-piece", "mihawk-one-piece", "Master & Student", "mentor"],
  ["gon-hunter-x-hunter", "killua-hunter-x-hunter", "Best Friends", "bond"],
  ["killua-hunter-x-hunter", "illumi-hunter-x-hunter", "Zoldyck Brothers", "family"],
  ["netero-hunter-x-hunter", "meruem-hunter-x-hunter", "The Final Duel", "rival"],
  ["hisoka-hunter-x-hunter", "chrollo-hunter-x-hunter", "Obsession", "rival"],
  ["gon-hunter-x-hunter", "biscuit-hunter-x-hunter", "Master & Student", "mentor"],
  ["tanjiro-demon-slayer", "zenitsu-demon-slayer", "Demon Slayer Corps", "bond"],
  ["tanjiro-demon-slayer", "inosuke-demon-slayer", "Demon Slayer Corps", "bond"],
  ["zenitsu-demon-slayer", "inosuke-demon-slayer", "Demon Slayer Corps", "bond"],
  ["tanjiro-demon-slayer", "giyu-demon-slayer", "Water Breathing", "mentor"],
  ["muzan-demon-slayer", "kokushibo-demon-slayer", "Master & Upper Moon", "bond"],
  ["giyu-demon-slayer", "shinobu-demon-slayer", "Hashira Pair", "bond"],
  ["deku-my-hero-academia", "bakugo-my-hero-academia", "Childhood Rivals", "rival"],
  ["endeavor-my-hero-academia", "todoroki-my-hero-academia", "Father & Son", "family"],
  ["endeavor-my-hero-academia", "dabi-my-hero-academia", "Father & Son", "family"],
  ["todoroki-my-hero-academia", "dabi-my-hero-academia", "Brothers", "family"],
  ["deku-my-hero-academia", "aizawa-my-hero-academia", "Teacher & Student", "mentor"],
  ["shigaraki-my-hero-academia", "dabi-my-hero-academia", "League of Villains", "bond"],
  ["eren-titan-attack-on-titan", "mikasa-attack-on-titan", "Shiganshina Trio", "bond"],
  ["eren-titan-attack-on-titan", "armin-attack-on-titan", "Shiganshina Trio", "bond"],
  ["mikasa-attack-on-titan", "armin-attack-on-titan", "Shiganshina Trio", "bond"],
  ["levi-attack-on-titan", "erwin-attack-on-titan", "Commander & Captain", "mentor"],
  ["eren-titan-attack-on-titan", "zeke-attack-on-titan", "Half Brothers", "family"],
  ["edward-elric-fullmetal-alchemist", "alphonse-fullmetal-alchemist", "Elric Brothers", "family"],
  ["edward-elric-fullmetal-alchemist", "roy-mustang-fullmetal-alchemist", "Colonel & Major", "mentor"],
  ["roy-mustang-fullmetal-alchemist", "olivier-fullmetal-alchemist", "Fellow Officers", "bond"],
  ["denji-chainsaw-man", "power-chainsaw-man", "Devil Roommates", "bond"],
  ["denji-chainsaw-man", "aki-chainsaw-man", "Devil Roommates", "bond"],
  ["aki-chainsaw-man", "power-chainsaw-man", "Devil Roommates", "bond"],
  ["makima-chainsaw-man", "denji-chainsaw-man", "Master & Hound", "bond"],
  ["kishibe-chainsaw-man", "aki-chainsaw-man", "Mentor & Devil Hunter", "mentor"],
  ["natsu-fairy-tail", "gray-fairy-tail", "Eternal Rivals", "rival"],
  ["natsu-fairy-tail", "erza-fairy-tail", "Fairy Tail Team", "bond"],
  ["zeref-fairy-tail", "natsu-fairy-tail", "Brothers", "family"],
  ["mavis-fairy-tail", "zeref-fairy-tail", "The Cursed Pair", "bond"],
  ["gildarts-fairy-tail", "natsu-fairy-tail", "Mentor & Student", "mentor"],
  ["escanor-seven-deadly-sins", "meliodas-seven-deadly-sins", "Pride & Wrath", "bond"],
  ["meliodas-seven-deadly-sins", "zeldris-seven-deadly-sins", "Demon Brothers", "family"],
  ["meliodas-seven-deadly-sins", "estarossa-seven-deadly-sins", "Demon Brothers", "family"],
  ["meliodas-seven-deadly-sins", "ban-seven-deadly-sins", "Best Friends", "bond"],
  ["saitama-one-punch-man", "genos-one-punch-man", "Master & Disciple", "mentor"],
  ["bang-one-punch-man", "garou-one-punch-man", "Master & Student", "mentor"],
  ["saitama-one-punch-man", "garou-one-punch-man", "The Final Fight", "rival"],
  ["blast-one-punch-man", "tatsumaki-one-punch-man", "S-Class Elite", "bond"],
  ["asta-black-clover", "yuno-black-clover", "Sworn Rivals", "rival"],
  ["yami-black-clover", "asta-black-clover", "Captain & Rookie", "mentor"],
  ["julius-black-clover", "yami-black-clover", "Wizard King & Captain", "bond"],
  ["asta-black-clover", "noelle-black-clover", "Black Bulls", "bond"],
  ["kaneki-tokyo-ghoul", "touka-tokyo-ghoul", "Anteiku Bond", "bond"],
  // ── unlocked by the roster expansion ──
  ["naruto-naruto", "sasuke-naruto", "Sworn Rivals", "rival"],
  ["itachi-naruto", "sasuke-naruto", "Uchiha Brothers", "family"],
  ["orochimaru-naruto", "sasuke-naruto", "Master & Student", "mentor"],
  ["kakashi-naruto", "sasuke-naruto", "Team 7", "bond"],
  ["naruto-naruto", "sakura-naruto", "Team 7", "bond"],
  ["sasuke-naruto", "sakura-naruto", "Team 7", "bond"],
  ["kakashi-naruto", "sakura-naruto", "Team 7", "bond"],
  ["tsunade-naruto", "sakura-naruto", "Master & Student", "mentor"],
  ["jiraiya-naruto", "orochimaru-naruto", "Legendary Sannin", "bond"],
  ["tsunade-naruto", "orochimaru-naruto", "Legendary Sannin", "bond"],
  ["ichigo-bleach", "orihime-bleach", "Karakura Bond", "bond"],
  ["ichigo-bleach", "renji-bleach", "Clashing Blades", "rival"],
  ["byakuya-bleach", "renji-bleach", "Captain & Lieutenant", "mentor"],
  ["yamamoto-bleach", "kenpachi-bleach", "Gotei 13", "bond"],
  ["yamamoto-bleach", "byakuya-bleach", "Gotei 13", "bond"],
  ["roger-one-piece", "shanks-one-piece", "Captain & Apprentice", "mentor"],
  ["roger-one-piece", "whitebeard-one-piece", "Rival Emperors", "rival"],
  ["whitebeard-one-piece", "ace-one-piece", "Father & Son", "family"],
  ["luffy-one-piece", "roger-one-piece", "Inherited Will", "mentor"],
];

// Guard: a typo'd id would silently create a duo that can never trigger.
if (typeof console !== "undefined") {
  const unknown = [];
  for (const [a, b] of DUOS) {
    if (!byId(a)) unknown.push(a);
    if (!byId(b)) unknown.push(b);
  }
  if (unknown.length) console.error("[animeVS synergy] DUOS references unknown character ids:\n  " + [...new Set(unknown)].join("\n  "));
}

// Returns every duo active on a squad. `team` is [{character, roleId}].
function activeDuos(team) {
  const ids = new Set(team.filter(Boolean).map((m) => m.character.id));
  const list = [];
  for (const [a, b, label, kind] of DUOS) {
    if (ids.has(a) && ids.has(b)) list.push({ a, b, label, kind, bonus: DUO_BONUS });
  }
  return list;
}

// Pairs a character could still complete, given who's already placed. Drives
// the "one more to go" hints — the whole reason Spin players can see this
// system at all, since only ~5% of random squads stumble into a duo.
function potentialDuos(character, team) {
  if (!character) return [];
  const ids = new Set(team.filter(Boolean).map((m) => m.character.id));
  if (ids.has(character.id)) return [];
  const list = [];
  for (const [a, b, label, kind] of DUOS) {
    if (a === character.id && ids.has(b)) list.push({ partner: byId(b), label, kind });
    else if (b === character.id && ids.has(a)) list.push({ partner: byId(a), label, kind });
  }
  return list;
}

function squadScore(myTeam, oppChars, boost = 1, ctx = {}) {
  const clean = myTeam.filter(Boolean);
  const chars = clean.map((m) => m.character);
  // determine highest-rated for overwhelm
  const maxRating = Math.max(...chars.map((c) => c.rating));
  const aura = auraTargets(clean);
  const rungNumber = ctx.rungNumber || 0;

  let base = 0;
  const abilityNotes = [];
  clean.forEach((m) => {
    const isHighest = m.character.rating === maxRating;
    let r = fittedRatingWithAbility(m, { rungNumber, isHighest });
    if (aura[m.roleId]) r += aura[m.roleId]; // receive neighbor aura
    base += r;
    const ab = m.character.ability;
    if (ab) {
      if (ab.type === "role_synergy" && ab.role === m.roleId) abilityNotes.push(`${ab.name}`);
      if (ab.type === "clutch" && Number.isFinite(rungNumber) && rungNumber >= 6 && rungNumber <= 10) abilityNotes.push(`${ab.name}`);
      if (ab.type === "overwhelm" && isHighest) abilityNotes.push(`${ab.name}`);
      if (ab.type === "adaptable" && roleFit(m.character, m.roleId).bonus < 5) abilityNotes.push(`${ab.name}`);
    }
  });
  base = base * boost;

  // rival_bonus
  clean.forEach((m) => {
    const ab = m.character.ability;
    if (ab && ab.type === "rival_bonus" && ctx.universe === ab.universe) {
      base += (ab.x || 0); abilityNotes.push(`${ab.name}`);
    }
  });

  // counters — projected tags only exist for counter math; they do not become
  // permanent character tags. Counter rewards scale with advantage and tier.
  const edgeDetails = counterEdgesFor(clean, oppChars);
  const bonus = edgeDetails.reduce((sum, edge) => sum + edge.bonus, 0);
  const edges = edgeDetails.map((edge) => edge.label);
  const hasImmunity = clean.some((m) => m.character.ability && m.character.ability.type === "counter_immune");
  // Synergy: on by default; the ladder's opponent side passes synergy:false.
  const duoDetails = ctx.synergy === false ? [] : activeDuos(clean);
  const duoBonus = duoDetails.reduce((sum, d) => sum + d.bonus, 0);
  return { total: base + bonus + duoBonus, base, bonus, duoBonus, duoDetails,
    duos: duoDetails.map((d) => d.label), edges, edgeDetails,
    abilityNotes: [...new Set(abilityNotes)], hasImmunity };
}

// Opponent squads are auto-assigned to roles by best fit (so they get fair role bonuses too)
function autoAssign(chars) {
  const roleIds = ROLES.map((r) => r.id);
  return chars.map((c, i) => {
    let best = roleIds[i % roleIds.length], bestFit = -1;
    for (const rid of roleIds) {
      const f = roleFit(c, rid).bonus;
      if (f > bestFit) { bestFit = f; best = rid; }
    }
    return { character: c, roleId: best };
  });
}

function resolveRung(myTeam, rung) {
  const oppChars = rung.team.map(byId);
  const oppTeam = autoAssign(oppChars);
  const meCtx = { rungNumber: rung.rung, universe: rung.universe, synergy: true };
  const themCtx = { rungNumber: rung.rung, universe: null, synergy: false };
  let me = squadScore(myTeam, oppChars, 1, meCtx);
  let them = squadScore(oppTeam, myTeam.map((m) => m.character), rung.boost, themCtx);
  // counter_immune cancels the strongest active enemy counter, not simply the
  // first relationship in the hard-coded counter list.
  if (me.hasImmunity) them = applyStrongestCounterImmunity(them);
  if (them.hasImmunity) me = applyStrongestCounterImmunity(me);
  return { me, them, cleared: me.total >= them.total };
}

// ─── PVP: team vs team, no boost. Higher total wins. ────────────────────────
function resolvePvP(teamA, teamB) {
  const charsA = teamA.map((m) => m.character);
  const charsB = teamB.map((m) => m.character);
  let a = squadScore(teamA, charsB, 1, { rungNumber: 5, universe: null, synergy: true });
  let b = squadScore(teamB, charsA, 1, { rungNumber: 5, universe: null, synergy: true });
  // mutual counter immunity: each side cancels the opponent's strongest edge.
  if (a.hasImmunity) b = applyStrongestCounterImmunity(b);
  if (b.hasImmunity) a = applyStrongestCounterImmunity(a);
  const winner = a.total === b.total ? "tie" : a.total > b.total ? "a" : "b";
  return { a, b, winner };
}

// ─── TEAM CODEC (order-independent, checksummed) ────────────────────────────
const CODEC_ROLES = ROLES.map((r) => r.id); // dynamic: all roles in order
const SLOT_COUNT = CODEC_ROLES.length;
// ─── FROZEN CODEC ID TABLE ─────────────────────────────────────────────────
// A team/result code stores each fighter as an INDEX into this list. The list
// is therefore frozen: it was seeded from the roster's alphabetical order at
// the time share links first shipped, and every code ever generated points
// into these exact positions.
//
//   *** NEVER insert, reorder, rename or delete an entry. ***
//   *** New characters are APPENDED to the end, always. ***
//
// Inserting a name that sorts early (say "Renji") would shift every index
// after it, and every link already shared would silently decode to a
// DIFFERENT squad — the checksum only covers the payload, not the roster, so
// nothing would look broken. If a character is retired from CHARACTERS, leave
// its id here as a tombstone; decoding an old code that references it returns
// a clean "unknown fighter" error instead of the wrong fighter.
//
// Capacity is 256 (the index is 8 bits per slot).
const CODEC_IDS = [
  "ace-one-piece", "aizawa-my-hero-academia", "aizen-bleach",
  "akaza-demon-slayer", "aki-chainsaw-man", "alphonse-fullmetal-alchemist",
  "android-18-dragon-ball", "armin-attack-on-titan", "asta-black-clover",
  "atomic-samurai-one-punch-man", "bakugo-my-hero-academia", "ban-seven-deadly-sins",
  "bang-one-punch-man", "beam-chainsaw-man", "beerus-dragon-ball",
  "biscuit-hunter-x-hunter", "blast-one-punch-man", "boros-one-punch-man",
  "broly-dragon-ball", "byakuya-bleach", "cell-dragon-ball",
  "choso-jujutsu-kaisen", "chrollo-hunter-x-hunter", "crocodile-one-piece",
  "dabi-my-hero-academia", "deku-my-hero-academia", "denji-chainsaw-man",
  "doflamingo-one-piece", "doma-demon-slayer", "edward-elric-fullmetal-alchemist",
  "endeavor-my-hero-academia", "eren-titan-attack-on-titan", "erwin-attack-on-titan",
  "erza-fairy-tail", "escanor-seven-deadly-sins", "estarossa-seven-deadly-sins",
  "father-fullmetal-alchemist", "feitan-hunter-x-hunter", "gaara-naruto",
  "garou-one-punch-man", "genos-one-punch-man", "geto-jujutsu-kaisen",
  "gildarts-fairy-tail", "giyu-demon-slayer", "gohan-dragon-ball",
  "gojo-satoru-jujutsu-kaisen", "goku-dragon-ball", "gon-hunter-x-hunter",
  "gowther-seven-deadly-sins", "gran-torino-my-hero-academia", "gray-fairy-tail",
  "greed-fullmetal-alchemist", "gremmy-bleach", "gyomei-demon-slayer",
  "hakari-jujutsu-kaisen", "hashirama-naruto", "hisoka-hunter-x-hunter",
  "historia-attack-on-titan", "ichigo-bleach", "illumi-hunter-x-hunter",
  "inosuke-demon-slayer", "itachi-naruto", "jean-attack-on-titan",
  "jellal-fairy-tail", "jiraiya-naruto", "jiren-dragon-ball",
  "julius-black-clover", "kaido-one-piece", "kakashi-naruto",
  "kaneki-tokyo-ghoul", "katana-man-chainsaw-man", "kenpachi-bleach",
  "killua-hunter-x-hunter", "king-bradley-fullmetal-alchemist", "kishibe-chainsaw-man",
  "kisuke-bleach", "kokushibo-demon-slayer", "kurapika-hunter-x-hunter",
  "law-one-piece", "laxus-fairy-tail", "levi-attack-on-titan",
  "luffy-one-piece", "madara-naruto", "mahito-jujutsu-kaisen",
  "majin-buu-dragon-ball", "maki-jujutsu-kaisen", "makima-chainsaw-man",
  "mavis-fairy-tail", "megumi-jujutsu-kaisen", "meliodas-seven-deadly-sins",
  "mereoleona-black-clover", "merlin-seven-deadly-sins", "meruem-hunter-x-hunter",
  "metal-bat-one-punch-man", "might-guy-naruto", "mihawk-one-piece",
  "mikasa-attack-on-titan", "minato-naruto", "mirko-my-hero-academia",
  "muzan-demon-slayer", "nanami-jujutsu-kaisen", "naruto-naruto",
  "natsu-fairy-tail", "neferpitou-hunter-x-hunter", "netero-hunter-x-hunter",
  "nobara-jujutsu-kaisen", "noelle-black-clover", "nozel-black-clover",
  "obito-naruto", "olivier-fullmetal-alchemist", "overhaul-my-hero-academia",
  "pain-naruto", "piccolo-dragon-ball", "power-chainsaw-man",
  "reiner-titan-attack-on-titan", "rengoku-demon-slayer", "reze-chainsaw-man",
  "roy-mustang-fullmetal-alchemist", "saitama-one-punch-man", "sanji-one-piece",
  "scar-fullmetal-alchemist", "shanks-one-piece", "shigaraki-my-hero-academia",
  "shinobu-demon-slayer", "sukuna-jujutsu-kaisen", "tanjiro-demon-slayer",
  "tatsumaki-one-punch-man", "tengen-demon-slayer", "todo-jujutsu-kaisen",
  "todoroki-my-hero-academia", "toshiro-bleach", "touka-tokyo-ghoul",
  "trunks-dragon-ball", "tsunade-naruto", "ulquiorra-bleach",
  "vegeta-dragon-ball", "yami-black-clover", "yhwach-bleach",
  "yoruichi-bleach", "yuji-itadori-jujutsu-kaisen", "yuno-black-clover",
  "yuta-jujutsu-kaisen", "zagred-black-clover", "zeke-attack-on-titan",
  "zeldris-seven-deadly-sins", "zenitsu-demon-slayer", "zeref-fairy-tail",
  "zoro-one-piece",
  // ── appended after the original alphabetical seed (never reorder above) ──
  "sasuke-naruto", "orochimaru-naruto", "sakura-naruto",
  "yamamoto-bleach", "renji-bleach", "orihime-bleach",
  "roger-one-piece", "whitebeard-one-piece"
];

// Guard: catches the mistake above at dev time instead of in users' links.
if (typeof console !== "undefined") {
  const unregistered = CHARACTERS.filter((c) => !CODEC_IDS.includes(c.id)).map((c) => c.id);
  if (unregistered.length) {
    console.error(
      "[animeVS codec] These characters are missing from CODEC_IDS and cannot be encoded.\n" +
      "APPEND them to the END of the list (never insert):\n  " + unregistered.join("\n  ")
    );
  }
  if (CODEC_IDS.length > 256) {
    console.error("[animeVS codec] CODEC_IDS has " + CODEC_IDS.length + " entries; the 8-bit index only addresses 256.");
  }
}
function _b64url(bytes){ let bin=String.fromCharCode(...bytes); let s=btoa(bin); return s.replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
function _unb64url(str){ str=str.replace(/-/g,"+").replace(/_/g,"/"); while(str.length%4)str+="="; const bin=atob(str); return [...bin].map((c)=>c.charCodeAt(0)); }
function _checksum(str){ let h=0; for(const ch of str) h=(h*31+ch.charCodeAt(0))%36; return h.toString(36).toUpperCase(); }

function encodeTeam(team){ // team: [{character, roleId}] — 11 bits/slot (8 char + 3 role)
  const ordered = CODEC_ROLES.map((rid) => team.find((t) => t.roleId === rid));
  if (ordered.some((m) => !m)) return null;
  let bits = [];
  for (const m of ordered){
    const ci = CODEC_IDS.indexOf(m.character.id), ri = CODEC_ROLES.indexOf(m.roleId);
    if (ci < 0) return null; // not in the frozen table — encoding would produce a wrong code
    for (let b=7;b>=0;b--) bits.push((ci>>b)&1);
    for (let b=2;b>=0;b--) bits.push((ri>>b)&1);
  }
  const bytes=[];
  for (let i=0;i<bits.length;i+=8){ let byte=0; for(let j=0;j<8;j++) byte=(byte<<1)|(bits[i+j]||0); bytes.push(byte); }
  const body=_b64url(bytes);
  return "V2"+body+_checksum(body);
}
function decodeTeam(code){
  try{
    if(!code || code.slice(0,2)!=="V2") return { error: code && code.slice(0,2)==="V1" ? "That code is from an older version — teams are now 7 fighters" : "Not a valid team code" };
    const body=code.slice(2,-1), cs=code.slice(-1);
    if(_checksum(body)!==cs) return { error:"Code looks mistyped — check it and try again" };
    const bytes=_unb64url(body);
    let bits=[]; bytes.forEach((byte)=>{ for(let b=7;b>=0;b--) bits.push((byte>>b)&1); });
    const team=[];
    for(let s=0;s<SLOT_COUNT;s++){
      let ci=0; for(let b=0;b<8;b++) ci=(ci<<1)|bits[s*11+b];
      let ri=0; for(let b=0;b<3;b++) ri=(ri<<1)|bits[s*11+8+b];
      const id=CODEC_IDS[ci]; const character=byId(id);
      if(!character) return { error:"Code references an unknown fighter" };
      team.push({ character, roleId: CODEC_ROLES[ri] });
    }
    return { team };
  } catch(e){ return { error:"Could not read that code" }; }
}

// ─── RESULT CODEC (team + rung reached, for shareable snapshot links) ───────
// Reuses the same 11-bit-per-slot team packing, plus 4 bits for rung reached
// (0-10 fits in 4 bits). Separate "R" version tag so it's never confused with
// a live PvP challenge code.
function encodeResult(team, reached){
  const ordered = CODEC_ROLES.map((rid) => team.find((t) => t.roleId === rid));
  if (ordered.some((m) => !m)) return null;
  let bits = [];
  for (const m of ordered){
    const ci = CODEC_IDS.indexOf(m.character.id), ri = CODEC_ROLES.indexOf(m.roleId);
    if (ci < 0) return null; // not in the frozen table — encoding would produce a wrong code
    for (let b=7;b>=0;b--) bits.push((ci>>b)&1);
    for (let b=2;b>=0;b--) bits.push((ri>>b)&1);
  }
  for (let b=3;b>=0;b--) bits.push((reached>>b)&1); // 4 bits for rung 0-10, right after team bits
  const bytes=[];
  for (let i=0;i<bits.length;i+=8){ let byte=0; for(let j=0;j<8;j++) byte=(byte<<1)|(bits[i+j]||0); bytes.push(byte); }
  const body=_b64url(bytes);
  return "R1"+body+_checksum(body);
}
function decodeResult(code){
  try{
    if(!code || code.slice(0,2)!=="R1") return { error:"Not a valid result code" };
    const body=code.slice(2,-1), cs=code.slice(-1);
    if(_checksum(body)!==cs) return { error:"Code looks mistyped — check it and try again" };
    const bytes=_unb64url(body);
    let bits=[]; bytes.forEach((byte)=>{ for(let b=7;b>=0;b--) bits.push((byte>>b)&1); });
    const team=[];
    for(let s=0;s<SLOT_COUNT;s++){
      let ci=0; for(let b=0;b<8;b++) ci=(ci<<1)|bits[s*11+b];
      let ri=0; for(let b=0;b<3;b++) ri=(ri<<1)|bits[s*11+8+b];
      const id=CODEC_IDS[ci]; const character=byId(id);
      if(!character) return { error:"Code references an unknown fighter" };
      team.push({ character, roleId: CODEC_ROLES[ri] });
    }
    let reached=0; const base=SLOT_COUNT*11; for(let b=0;b<4;b++) reached=(reached<<1)|bits[base+b];
    return { team, reached };
  } catch(e){ return { error:"Could not read that code" }; }
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function drawFrom(pool, size, seed) {
  const rng = mulberry32(seed);
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, size);
}

// ─── AUCTION (live PvP) ─────────────────────────────────────────────────────
// A live ascending auction. One fighter at a time comes up for sale, both
// players bid against a clock, the winner pays what they bid and gets the
// fighter. First to fill all 7 slots wins the right to stop bidding.
//
// Everything below is PURE: state in, new state (or null if illegal) out. The
// room row in Supabase holds exactly one of these state objects, and every
// write is a compare-and-set on the row version, so two clients racing each
// other always resolve to one agreed outcome. Keeping it pure also means
// healthcheck.mjs can play whole auctions without a browser or a database.
const AUCTION_BUDGET = 50;      // same scale as Draft credits: a fighter's cost is a fair price
const AUCTION_MIN_BID = 1;
const AUCTION_SPIN_MS = 1800;   // reel runs, then bidding opens
const AUCTION_OPEN_MS = 12000;  // clock to open the bidding on a fresh lot
const AUCTION_RESET_MS = 7000;  // clock after every bid
const AUCTION_SOLD_MS = 4200;   // pause so both players can read the result
const AUCTION_MAX_DRY = 4;      // unsold lots in a row before empty slots are auto-filled
const auctionOther = (who) => (who === "a" ? "b" : "a");

let _auctionOrderCache = { seed: null, order: null };
function auctionOrder(seed) {
  if (_auctionOrderCache.seed === seed) return _auctionOrderCache.order;
  // Sorted first so the shuffle never depends on how the roster array is ordered.
  const ids = CHARACTERS.map((c) => c.id).sort();
  const order = drawFrom(ids, ids.length, seed);
  _auctionOrderCache = { seed, order };
  return order;
}
function auctionLot(s) { return byId(auctionOrder(s.seed)[s.lot]); }

function auctionNew(seed) {
  const side = () => ({ money: AUCTION_BUDGET, won: [] });
  return { seed, phase: "lobby", joined: { a: true, b: false }, lot: 0, seq: 0,
           hi: 0, hiBy: null, folded: null, a: side(), b: side(), dry: 0, last: null,
           teams: { a: null, b: null } };
}

// The most this player may bid right now. $1 stays reserved for every slot they
// still have to fill AFTER this one, so nobody can spend themselves into a team
// they can no longer complete (same idea as Draft's reserve rule).
function auctionMaxBid(s, who) {
  const owned = s[who].won.length;
  if (owned >= PICKS) return 0;
  return s[who].money - (PICKS - owned - 1) * AUCTION_MIN_BID;
}
function auctionClockMs(s) {
  if (s.phase === "spin") return AUCTION_SPIN_MS;
  if (s.phase === "bid") return s.hiBy ? AUCTION_RESET_MS : AUCTION_OPEN_MS;
  if (s.phase === "sold") return AUCTION_SOLD_MS;
  return null;
}
function auctionKey(s) { return `${s.phase}:${s.lot}:${s.seq}`; }

function auctionJoin(s) {
  if (s.phase !== "lobby" || s.joined.b) return null;
  return { ...s, joined: { ...s.joined, b: true } };
}
function auctionStart(s) {
  if (s.phase !== "lobby" || !s.joined.b) return null;
  return { ...s, phase: "spin", lot: 0, seq: s.seq + 1 };
}
function auctionOpen(s) {
  if (s.phase !== "spin") return null;
  return { ...s, phase: "bid", seq: s.seq + 1 };
}

function auctionSell(s) {
  const who = s.hiBy;
  const lotId = auctionOrder(s.seed)[s.lot];
  return { ...s, phase: "sold", seq: s.seq + 1, dry: 0,
    [who]: { money: s[who].money - s.hi, won: [...s[who].won, { id: lotId, price: s.hi }] },
    last: { lot: s.lot, id: lotId, by: who, price: s.hi } };
}
function auctionUnsold(s) {
  const lotId = auctionOrder(s.seed)[s.lot];
  return { ...s, phase: "sold", seq: s.seq + 1, dry: s.dry + 1,
    last: { lot: s.lot, id: lotId, by: null, price: 0 } };
}

function auctionBid(s, who, amount) {
  if (s.phase !== "bid") return null;
  amount = Math.floor(amount);
  if (!Number.isFinite(amount) || amount < AUCTION_MIN_BID) return null;
  if (s.hiBy === who) return null;                 // already leading
  if (amount < s.hi + AUCTION_MIN_BID) return null; // must beat the current bid
  if (amount > auctionMaxBid(s, who)) return null;
  const n = { ...s, hi: amount, hiBy: who, folded: null, seq: s.seq + 1 };
  // If the rival can't raise (full, or out of spendable money) the lot is sold now.
  if (auctionMaxBid(n, auctionOther(who)) < amount + AUCTION_MIN_BID) return auctionSell(n);
  return n;
}
// Folding. Against a standing bid: concede, the leader wins at that price.
// With no bid yet: a pass; once both have passed (or the rival can't bid) it's unsold.
function auctionFold(s, who) {
  if (s.phase !== "bid" || s.hiBy === who) return null;
  if (s.hiBy) return auctionSell(s);
  const rival = auctionOther(who);
  if (s.folded === rival || auctionMaxBid(s, rival) < AUCTION_MIN_BID) return auctionUnsold(s);
  return { ...s, folded: who };
}
function auctionExpire(s) {
  if (s.phase !== "bid") return null;
  return s.hiBy ? auctionSell(s) : auctionUnsold(s);
}

// Anyone still short when the auction ends is topped up with the cheapest
// unclaimed fighters, alternating between players so neither gets first dibs.
function auctionAutofill(s) {
  const order = auctionOrder(s.seed);
  const owned = new Set([...s.a.won, ...s.b.won].map((w) => w.id));
  const seen = order.slice(0, s.lot + 1).filter((id) => !owned.has(id));
  const unseen = order.slice(s.lot + 1).filter((id) => !owned.has(id));
  const pool = [...seen.sort((x, y) => byId(x).cost - byId(y).cost || (x < y ? -1 : 1)), ...unseen];
  const n = { ...s, a: { ...s.a, won: [...s.a.won] }, b: { ...s.b, won: [...s.b.won] } };
  let i = 0;
  while ((n.a.won.length < PICKS || n.b.won.length < PICKS) && i < pool.length) {
    for (const who of ["a", "b"]) {
      if (n[who].won.length < PICKS && i < pool.length) n[who].won.push({ id: pool[i++], price: 0, auto: true });
    }
  }
  return n;
}
function auctionNext(s) {
  if (s.phase !== "sold") return null;
  const full = s.a.won.length >= PICKS && s.b.won.length >= PICKS;
  const exhausted = s.lot + 1 >= auctionOrder(s.seed).length;
  if (full) return { ...s, phase: "lock", seq: s.seq + 1 };
  if (s.dry >= AUCTION_MAX_DRY || exhausted) return { ...auctionAutofill(s), phase: "lock", seq: s.seq + 1 };
  return { ...s, phase: "spin", lot: s.lot + 1, hi: 0, hiBy: null, folded: null, seq: s.seq + 1 };
}
// A locked team is only accepted if it is exactly the 7 fighters that player holds.
function auctionTeamValid(s, who, team) {
  const mine = new Set(s[who].won.map((w) => w.id));
  const ids = team.map((m) => m.character.id);
  return team.length === PICKS && new Set(ids).size === PICKS && ids.every((id) => mine.has(id))
    && new Set(team.map((m) => m.roleId)).size === PICKS;
}
function auctionLock(s, who, code) {
  if (s.phase !== "lock" || s.teams[who]) return null;
  const teams = { ...s.teams, [who]: code };
  return { ...s, teams, phase: teams.a && teams.b ? "done" : "lock", seq: s.seq + 1 };
}

const INK = "#0b0c10";
const RED = "#ff2d35";
const TIER_COLOR = { SS:"#ff4d6d", S:"#fbbf24", A:"#f0abfc", B:"#7dd3fc", C:"#a8a29e" };
function TierBadge({ tier, small }) {
  const col = TIER_COLOR[tier] || "#a8a29e";
  return <span className="a" style={{ fontSize: small?11:13, color:"#0b0c10", background:col,
    padding: small?"0px 5px":"1px 7px", borderRadius:4, lineHeight:1.4, letterSpacing:"0.05em" }}>{tier}</span>;
}
const TAG_STYLE = {
  range:{bg:"#0e3a5c",fg:"#7dd3fc",bd:"#38bdf8"}, melee:{bg:"#5c1620",fg:"#fda4af",bd:"#fb7185"},
  mobility:{bg:"#0f3d2e",fg:"#6ee7b7",bd:"#34d399"}, barrier:{bg:"#5c4410",fg:"#fcd34d",bd:"#fbbf24"},
  element:{bg:"#3b1e5c",fg:"#c4b5fd",bd:"#a78bfa"}, giant:{bg:"#5c3410",fg:"#fdba74",bd:"#fb923c"},
  aura:{bg:"#5c1550",fg:"#f0abfc",bd:"#e879f9"}, summon:{bg:"#0f4a4a",fg:"#5eead4",bd:"#2dd4bf"},
  speed:{bg:"#0c4a4e",fg:"#67e8f9",bd:"#22d3ee"}, energy:{bg:"#4a3410",fg:"#fde047",bd:"#facc15"},
  stealth:{bg:"#1e293b",fg:"#cbd5e1",bd:"#94a3b8"}, psychic:{bg:"#4a1d4f",fg:"#f0abfc",bd:"#d946ef"},
  regen:{bg:"#14432a",fg:"#86efac",bd:"#4ade80"}, transform:{bg:"#4a2410",fg:"#fdba74",bd:"#f97316"},
  heal:{bg:"#134e3a",fg:"#6ee7b7",bd:"#10b981"},
};

// ─── ROOT ───────────────────────────────────────────────────────────────────
export default function App() {
  // Open directly into the live PvP room when a room code is present, or into a shared result.
  const [mode, setMode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("result")) return "result";
      if (params.get("room")) return "pvp";
      if (params.has("daily")) return "daily";
    } catch (e) {}
    return null;
  }); // null | "draft" | "spin" | "pvp" | "daily" | "result"
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [idle, setIdle] = useState(false);
  React.useEffect(() => { scrollToTop(); }, [mode]);
  React.useEffect(() => {
    const go = () => { setIdle(true); startSmoothScroll(); };
    if ("requestIdleCallback" in window) { const id = window.requestIdleCallback(go, { timeout: 3000 }); return () => window.cancelIdleCallback(id); }
    const t = setTimeout(go, 2000); return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ minHeight:"100vh", background:INK, color:"#e7e5e4", fontFamily:"'Barlow', system-ui, sans-serif" }}>
      <Fonts />
      <div style={{ position:"relative", maxWidth:1024, margin:"0 auto", padding:"28px 20px 48px" }}>
        {mode !== null && <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(circle at 50% 0%, rgba(255,45,53,0.10), transparent 45%)", WebkitMaskImage:"linear-gradient(to right, transparent, #000 18%, #000 82%, transparent)", maskImage:"linear-gradient(to right, transparent, #000 18%, #000 82%, transparent)" }} />}
        <div style={{ position:"relative" }}>
          <Header mode={mode} onHome={() => { try { window.history.replaceState({}, "", window.location.pathname); } catch (e) {} setMode(null); }} onFeedback={() => setFeedbackOpen(true)} onGuide={() => setGuideOpen(true)} />
          {mode === null && <Home setMode={setMode} />}
          {mode === "draft" && <DraftMode />}
          {mode === "spin" && <SpinMode />}
          <Suspense fallback={<ModeLoading />}>
            {mode === "pvp" && <VersusMode />}
            {mode === "daily" && <DailyGame characters={CHARACTERS} />}
          </Suspense>
          {mode === "result" && <SharedResultView setMode={setMode} />}
        </div>
      </div>
      {feedbackOpen && <FeedbackModal currentMode={mode} onClose={() => setFeedbackOpen(false)} />}
      {guideOpen && <SystemGuideModal onClose={() => setGuideOpen(false)} />}
      {idle && <Suspense fallback={null}><Analytics /><SpeedInsights /></Suspense>}
    </div>
  );
}

function ModeLoading() {
  return (
    <div role="status" aria-live="polite" style={{ padding:"64px 0", textAlign:"center" }}>
      <div className="a" style={{ fontSize:28, color:"#57534e", animation:"reelFlash 1s ease-in-out infinite" }}>LOADING…</div>
    </div>
  );
}

// ─── HOW TO PLAY ─────────────────────────────────────────────────────────────
// Shown automatically the first time a player enters each mode (remembered via
// localStorage), and reopenable anytime via the "?" button. Falls back to
// showing every time if localStorage is unavailable — never breaks the mode.
const HOW_TO_PLAY = {
  spin: {
    title: "SPIN",
    accent: RED,
    steps: [
      { h:"Spin the reel", b:"Hit SPIN to summon a random fighter from the roster." },
      { h:"Place or reroll", b:"Slot them into one of your 7 roles, or discard and spin again. You get 1 reroll." },
      { h:"Fill all 7 roles", b:"Captain, Vice-Captain, Tank, Damage, Support, Support II, Healer — role-fit and signature bonuses boost fighters placed well." },
      { h:"Climb the ladder", b:"Once your squad is full, take on all 10 rungs. Clear as many as you can — the top is a real challenge." },
    ],
  },
  draft: {
    title: "DRAFT",
    accent: "#3b82f6",
    steps: [
      { h:"Spend a budget", b:"You've got a fixed credit budget to build all 7 fighters — stronger characters cost more." },
      { h:"Pick from 5 options", b:"Each spin draws 5 fighters. Choose one that fits your budget and roles, or reroll (2 allowed)." },
      { h:"Never get stuck", b:"The game always keeps enough budget in reserve so you can finish your team — no dead ends." },
      { h:"The harder challenge", b:"Draft's tighter budget makes the ladder tougher than Spin — a full clear here is a real achievement." },
    ],
  },
  auction: {
    title: "AUCTION",
    accent: "#f59e0b",
    steps: [
      { h:"One fighter at a time", b:"A reel spins and a fighter goes up for sale. You and your rival each start with $50 to fill all 7 roles." },
      { h:"Bid against the clock", b:"Raise the price or pass. Every bid resets a short clock, and when it runs out the top bidder pays what they bid and takes the fighter." },
      { h:"Winner takes them off the table", b:"A fighter you win can never be your rival's. Let one go and they may take him for less than you would have paid." },
      { h:"Place them straight away", b:"Each fighter you win must go into a role before you can bid again, so think about role fit while you bid. $1 is always held back per empty slot, so you can never be stranded short of a full team." },
      { h:"Lock in and reveal", b:"Once both squads are full, lock in. The two teams are scored head to head; unspent money is worth nothing." },
    ],
  },
  pvp: {
    title: "VERSUS",
    accent: "#a855f7",
    steps: [
      { h:"Build your team", b:"Spin to fill your 7 roles, same as Spin mode — your opponent can't see your picks." },
      { h:"Create or join a room", b:"Create a room and share its code, or enter a friend's room code to join." },
      { h:"Build blind", b:"Both players build privately. Neither side sees the other team before both lock in." },
      { h:"Reveal & resolve", b:"Once both teams are set, it reveals both squads — higher total score wins." },
    ],
  },
};

function useSeenModal(key) {
  const [seen, setSeen] = useState(() => {
    try { return localStorage.getItem(key) === "1"; } catch (e) { return false; }
  });
  function markSeen() {
    try { localStorage.setItem(key, "1"); } catch (e) {}
    setSeen(true);
  }
  return [seen, markSeen];
}

function HowToPlayModal({ modeId, onClose }) {
  const content = HOW_TO_PLAY[modeId];
  if (!content) return null;
  return (
    <div data-lenis-prevent onClick={onClose} style={{ position:"fixed", inset:0, zIndex:100, background:"rgba(0,0,0,0.7)",
      display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(2px)", padding:20 }}>
      <div onClick={(e)=>e.stopPropagation()} className="slam"
        style={{ width:"100%", maxWidth:480, maxHeight:"85vh", overflowY:"auto", background:"#141519",
          borderRadius:18, border:`1px solid ${content.accent}55`, padding:24 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
          <div className="a" style={{ fontSize:26, color:"#f5f5f4" }}>HOW TO PLAY <span style={{ color:content.accent }}>{content.title}</span></div>
          <button onClick={onClose} className="c" style={{ background:"transparent", border:"none", color:"#78716c", fontSize:22, cursor:"pointer", padding:4, lineHeight:1 }}>✕</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {content.steps.map((s, i) => (
            <div key={i} style={{ display:"flex", gap:14 }}>
              <div className="a" style={{ fontSize:20, color:content.accent, minWidth:26, flexShrink:0 }}>{i+1}</div>
              <div>
                <div className="c" style={{ fontWeight:700, fontSize:15, color:"#f5f5f4" }}>{s.h}</div>
                <div className="c" style={{ fontSize:13, color:"#a8a29e", marginTop:2, lineHeight:1.4 }}>{s.b}</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="a" style={{ marginTop:22, width:"100%", fontSize:17, padding:"13px", borderRadius:12,
          background:content.accent, color:"#fff", border:"none", cursor:"pointer" }}>
          GOT IT
        </button>
      </div>
    </div>
  );
}

// Small reopenable "?" button — drop into any mode's header area.
function HowToPlayButton({ onClick }) {
  return (
    <button onClick={onClick} className="c"
      style={{ width:30, height:30, borderRadius:999, border:"1px solid rgba(255,255,255,0.18)", background:"rgba(255,255,255,0.05)",
        color:"#a8a29e", cursor:"pointer", fontWeight:700, fontSize:14, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
      ?
    </button>
  );
}

// ─── SYSTEM GUIDE ────────────────────────────────────────────────────────────
// Full explainer for how scoring actually works — role fit, signature bonus,
// the counter web, and tier tag caps. Opened via the "📖 Guide" header button.
function SystemGuideModal({ onClose }) {
  const [tab, setTab] = useState("roles");
  const TABS = [
    { id:"roles",    label:"Role Fit" },
    { id:"signature",label:"Signature" },
    { id:"counters", label:"Counters" },
    { id:"synergy",  label:"Synergy" },
    { id:"tiers",    label:"Tier Caps" },
  ];

  return (
    <div data-lenis-prevent onClick={onClose} style={{ position:"fixed", inset:0, zIndex:100, background:"rgba(0,0,0,0.75)",
      display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(2px)", padding:16 }}>
      <div onClick={(e)=>e.stopPropagation()} className="slam"
        style={{ width:"100%", maxWidth:600, maxHeight:"88vh", overflowY:"auto", background:"#141519",
          borderRadius:18, border:"1px solid rgba(255,255,255,0.12)", padding:"20px 20px 26px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
          <div className="a" style={{ fontSize:26, color:"#f5f5f4" }}>HOW SCORING WORKS</div>
          <button onClick={onClose} className="c" style={{ background:"transparent", border:"none", color:"#78716c", fontSize:22, cursor:"pointer", padding:4, lineHeight:1 }}>✕</button>
        </div>
        <p className="c" style={{ fontSize:13, color:"#a8a29e", marginTop:6, marginBottom:16, lineHeight:1.5 }}>
          Every fighter's final score in a battle comes from five layers stacked together. Flip through each tab below.
        </p>

        <div style={{ display:"flex", gap:6, marginBottom:18, flexWrap:"wrap" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className="c"
              style={{ padding:"7px 14px", borderRadius:999, fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em",
                cursor:"pointer", border: tab===t.id?`1px solid ${RED}`:"1px solid rgba(255,255,255,0.14)",
                background: tab===t.id?"rgba(255,45,53,0.12)":"rgba(255,255,255,0.03)", color: tab===t.id?"#ff8a8f":"#a8a29e" }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "roles" && <GuideRoles />}
        {tab === "signature" && <GuideSignature />}
        {tab === "counters" && <GuideCounters />}
        {tab === "synergy" && <GuideSynergy />}
        {tab === "tiers" && <GuideTiers />}
      </div>
    </div>
  );
}

function GuideSection({ title, children }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div className="c" style={{ fontSize:12, textTransform:"uppercase", letterSpacing:"0.15em", color:RED, fontWeight:700, marginBottom:8 }}>{title}</div>
      {children}
    </div>
  );
}

function GuideRoles() {
  return (
    <div>
      <GuideSection title="How role fit works">
        <p className="c" style={{ fontSize:13, color:"#d6d3d1", lineHeight:1.6, marginBottom:10 }}>
          Every role "wants" a few tags. When you place a fighter into a role, the game checks how many of their tags match — and adds flat points straight onto their rating:
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:12 }}>
          <FitRow tone="great" label="2+ matching tags" val="Perfect fit" pts="+15" />
          <FitRow tone="good" label="1 matching tag" val="Good fit" pts="+5" />
          <FitRow tone="bad" label="0 matching tags" val="Misfit" pts="+0" />
        </div>
        <p className="c" style={{ fontSize:12, color:"#78716c", lineHeight:1.5 }}>
          It's simple addition — a fighter's final score is always their base rating plus every bonus listed next to them. A misfit never loses points, it just doesn't gain any from role fit.
        </p>
      </GuideSection>
      <GuideSection title="What each role wants">
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {ROLES.map((r) => (
            <div key={r.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8, background:"rgba(255,255,255,0.03)" }}>
              <span style={{ height:8, width:8, borderRadius:999, background:r.color, flexShrink:0 }} />
              <span className="c" style={{ fontWeight:700, fontSize:13, color:"#f5f5f4", minWidth:100 }}>{r.name}</span>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{r.wants.map((t)=><Tag key={t} t={t} small />)}</div>
            </div>
          ))}
        </div>
      </GuideSection>
    </div>
  );
}
function FitRow({ tone, label, val, pts }) {
  const color = tone==="great" ? "#4ade80" : tone==="good" ? "#93c5fd" : "#f87171";
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", borderRadius:8, background:"rgba(255,255,255,0.03)", border:`1px solid ${color}33` }}>
      <span className="c" style={{ fontSize:13, color:"#a8a29e" }}>{label}</span>
      <span className="c" style={{ fontSize:13, fontWeight:700, color }}>{val} · {pts} pts</span>
    </div>
  );
}

function GuideSignature() {
  return (
    <div>
      <GuideSection title="Signature role bonus">
        <p className="c" style={{ fontSize:13, color:"#d6d3d1", lineHeight:1.6, marginBottom:10 }}>
          Every fighter has one canonical role — the one they're known for in their series. Placing them there grants a flat <b style={{color:"#4ade80"}}>+10 points</b> on top of their tag-fit bonus.
        </p>
        <p className="c" style={{ fontSize:13, color:"#d6d3d1", lineHeight:1.6, marginBottom:10 }}>
          This stacks with role fit — so a fighter in their signature role with 2+ matching tags gets <b>Perfect fit + Signature</b>, a full +25 points over their base rating.
        </p>
        <p className="c" style={{ fontSize:13, color:"#d6d3d1", lineHeight:1.6 }}>
          Even a misfit placement still earns the +10 if it's their signature role — the game never punishes lore-accurate placement.
        </p>
      </GuideSection>
      <GuideSection title="Where to see it">
        <p className="c" style={{ fontSize:13, color:"#a8a29e", lineHeight:1.6 }}>
          Look for the "· Signature" label next to a fighter's fit rating when you place them — that's this bonus applying. The spin reel also shows "Best as [Role]" as a hint before you place anyone.
        </p>
      </GuideSection>
    </div>
  );
}

function GuideCounters() {
  return (
    <div>
      <GuideSection title="The counter web">
        <p className="c" style={{ fontSize:13, color:"#d6d3d1", lineHeight:1.6, marginBottom:10 }}>
          Beyond role fit, your whole <b>team</b> can earn bonus points by out-countering the opponent's tags. Each edge starts at a tiered reward, then scales with your tag advantage: the first point of advantage is modest, a second adds <b>+5</b>, and a third or more caps the edge at <b>+20</b>.
        </p>
        <p className="c" style={{ fontSize:13, color:"#a8a29e", lineHeight:1.6, marginBottom:14 }}>
          This is why a lower-rated team can beat a higher-rated one — the right tag mix against a specific opponent matters as much as raw power.
        </p>
      </GuideSection>
      <GuideSection title="Every counter relationship">
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {COUNTERS.map((c) => (
            <div key={c.win+c.lose} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", borderRadius:8, background:"rgba(255,255,255,0.03)" }}>
              <Tag t={c.win} small /><span className="c" style={{ color:"#4ade80", fontWeight:700, fontSize:13 }}>beats</span><Tag t={c.lose} small />
              <span className="c" style={{ marginLeft:"auto", fontSize:10, color: c.tier==="strong"?"#fbbf24":c.tier==="core"?"#93c5fd":"#a8a29e", textTransform:"uppercase", letterSpacing:"0.08em" }}>{COUNTER_TIERS[c.tier]?.label || "Core"}</span>
            </div>
          ))}
        </div>
      </GuideSection>
    </div>
  );
}

function GuideSynergy() {
  const AMBER = "#fbbf24";
  const KINDS = [
    { id:"family", label:"Family" },
    { id:"mentor", label:"Mentor & Student" },
    { id:"rival",  label:"Rivals" },
    { id:"bond",   label:"Partners & Crews" },
  ];
  const bySeries = {};
  for (const [a, b, label, kind] of DUOS) {
    const c = byId(a);
    if (!c) continue;
    (bySeries[c.series] = bySeries[c.series] || []).push({ a, b, label, kind });
  }
  const series = Object.keys(bySeries).sort();
  return (
    <div>
      <GuideSection title="How synergy works">
        <p className="c" style={{ fontSize:13, color:"#d6d3d1", lineHeight:1.6, marginBottom:10 }}>
          Some fighters have history. Put both halves of a canon pairing on your squad — a parent and child, a master and student, sworn rivals, lifelong partners — and the squad earns a flat <b style={{ color:AMBER }}>+{DUO_BONUS}</b>. Role placement doesn't matter; they just both have to be on the team.
        </p>
        <p className="c" style={{ fontSize:13, color:"#a8a29e", lineHeight:1.6, marginBottom:10 }}>
          Every matching pair pays out separately, so a trio like the Shiganshina Trio or the Chainsaw Man flatshare counts as three pairs and stacks to <b style={{ color:AMBER }}>+{DUO_BONUS * 3}</b>. There are <b>{DUOS.length}</b> pairings in the game across <b>{series.length}</b> series.
        </p>
        <p className="c" style={{ fontSize:13, color:"#a8a29e", lineHeight:1.6 }}>
          On the <b>ladder</b>, synergy is yours alone — the enemy squads are canon teams and would otherwise run away with it. In <b>Versus</b>, both players get it, because both players drafted for it.
        </p>
      </GuideSection>

      <GuideSection title="Kinds of pairing">
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {KINDS.map((k) => (
            <span key={k.id} className="c" style={{ fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:999,
              background:"rgba(251,191,36,0.12)", color:AMBER, border:"1px solid rgba(251,191,36,0.28)" }}>
              {k.label} · {DUOS.filter((d) => d[3] === k.id).length}
            </span>
          ))}
        </div>
      </GuideSection>

      <GuideSection title="Every pairing">
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {series.map((s) => (
            <div key={s}>
              <div className="c" style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", color:"#78716c", marginBottom:5 }}>{s}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {bySeries[s].map((d, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", borderRadius:8, background:"rgba(255,255,255,0.03)" }}>
                    <span className="c" style={{ fontSize:13, color:"#f5f5f4", fontWeight:700 }}>
                      {byId(d.a).name} <span style={{ color:"#57534e" }}>+</span> {byId(d.b).name}
                    </span>
                    <span className="c" style={{ fontSize:11, color:"#a8a29e" }}>{d.label}</span>
                    <span className="a" style={{ marginLeft:"auto", fontSize:13, color:AMBER }}>+{DUO_BONUS}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </GuideSection>
    </div>
  );
}

function GuideTiers() {
  const tiers = [
    { t:"SS", cap:9, color:TIER_COLOR.SS },
    { t:"S",  cap:7, color:TIER_COLOR.S },
    { t:"A",  cap:6, color:TIER_COLOR.A },
    { t:"B",  cap:5, color:TIER_COLOR.B },
    { t:"C",  cap:4, color:TIER_COLOR.C },
  ];
  return (
    <div>
      <GuideSection title="Tier tag caps">
        <p className="c" style={{ fontSize:13, color:"#d6d3d1", lineHeight:1.6, marginBottom:14 }}>
          A fighter's tier limits how many combat tags they can carry — higher tiers are more versatile and can trigger more counter edges at once. Counter relationships are also tiered: some are situational, some core, and some strong, which changes their starting reward.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {tiers.map((x) => (
            <div key={x.t} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 12px", borderRadius:8, background:"rgba(255,255,255,0.03)" }}>
              <span className="a" style={{ fontSize:16, color:"#0b0c10", background:x.color, padding:"1px 10px", borderRadius:5 }}>{x.t}</span>
              <span className="c" style={{ fontSize:13, color:"#a8a29e" }}>up to <b style={{color:"#f5f5f4"}}>{x.cap}</b> tags</span>
            </div>
          ))}
        </div>
      </GuideSection>
      <GuideSection title="Why it matters">
        <p className="c" style={{ fontSize:13, color:"#a8a29e", lineHeight:1.6 }}>
          An SS-tier fighter carrying 9 tags can plug into far more counter matchups than a C-tier fighter capped at 4 — part of what makes top-tier fighters worth their higher draft cost. Counter Immunity now blocks the strongest active counter rather than whichever relationship happens to appear first.
        </p>
      </GuideSection>
    </div>
  );
}


// In-app feedback form. Submits to Web3Forms (free, no backend needed) which
// emails the submission straight to you. Get a free access key at web3forms.com
// (no account required beyond an email to receive the key) and paste it below.
const WEB3FORMS_KEY = "0be791f0-f6ee-4c1a-802b-8c5abb172caf"; // <-- paste your key from web3forms.com

const FEEDBACK_CATEGORIES = [
  { id:"bug",       label:"🐞 Bug Report",        hint:"Something broke or didn't work as expected" },
  { id:"suggestion",label:"💡 Suggestion",         hint:"An idea for a new feature or improvement" },
  { id:"balance",   label:"⚖️ Balance Feedback",   hint:"A character, tag, or the ladder feels off" },
];

function FeedbackModal({ currentMode, onClose }) {
  const [category, setCategory] = useState(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const configured = WEB3FORMS_KEY && !WEB3FORMS_KEY.includes("YOUR_");

  async function submit() {
    if (!category || !message.trim()) return;
    if (!configured) { setStatus("error"); return; }
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `animeVS feedback — ${FEEDBACK_CATEGORIES.find((c)=>c.id===category)?.label || category}`,
          category,
          message,
          reply_to: email || undefined,
          page_mode: currentMode || "home",
        }),
      });
      const data = await res.json();
      setStatus(data.success ? "sent" : "error");
    } catch (e) {
      setStatus("error");
    }
  }

  return (
    <div data-lenis-prevent onClick={onClose} style={{ position:"fixed", inset:0, zIndex:100, background:"rgba(0,0,0,0.7)",
      display:"flex", alignItems:"flex-end", justifyContent:"center", backdropFilter:"blur(2px)" }}>
      <div onClick={(e)=>e.stopPropagation()} className="slam"
        style={{ width:"100%", maxWidth:520, maxHeight:"85vh", overflowY:"auto", background:"#141519",
          borderRadius:"18px 18px 0 0", border:"1px solid rgba(255,255,255,0.1)", borderBottom:"none",
          padding:"20px 20px 28px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div className="a" style={{ fontSize:24, color:"#f5f5f4" }}>FEEDBACK</div>
          <button onClick={onClose} className="c" style={{ background:"transparent", border:"none", color:"#78716c", fontSize:22, cursor:"pointer", padding:4, lineHeight:1 }}>✕</button>
        </div>

        {status === "sent" ? (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:40, marginBottom:10 }}>✓</div>
            <div className="c" style={{ fontSize:16, fontWeight:700, color:"#4ade80", marginBottom:6 }}>Thanks — got it!</div>
            <div className="c" style={{ fontSize:13, color:"#a8a29e", marginBottom:18 }}>Your feedback helps shape the next update.</div>
            <button onClick={onClose} className="c" style={{ padding:"10px 24px", borderRadius:10, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.05)", color:"#e7e5e4", cursor:"pointer", fontWeight:700 }}>Close</button>
          </div>
        ) : (
          <>
            <div className="c" style={{ fontSize:12, textTransform:"uppercase", letterSpacing:"0.15em", color:"#78716c", fontWeight:700, marginBottom:8 }}>What kind of feedback?</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
              {FEEDBACK_CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => setCategory(c.id)}
                  style={{ textAlign:"left", padding:"12px 14px", borderRadius:10, cursor:"pointer",
                    border: category===c.id ? `1px solid ${RED}` : "1px solid rgba(255,255,255,0.12)",
                    background: category===c.id ? "rgba(255,45,53,0.1)" : "rgba(255,255,255,0.03)" }}>
                  <div className="c" style={{ fontWeight:700, fontSize:14, color:"#f5f5f4" }}>{c.label}</div>
                  <div className="c" style={{ fontSize:12, color:"#a8a29e", marginTop:2 }}>{c.hint}</div>
                </button>
              ))}
            </div>

            <div className="c" style={{ fontSize:12, textTransform:"uppercase", letterSpacing:"0.15em", color:"#78716c", fontWeight:700, marginBottom:8 }}>Details</div>
            <textarea value={message} onChange={(e)=>setMessage(e.target.value)} rows={4}
              placeholder={category==="bug" ? "What happened? What did you expect instead?" : category==="balance" ? "Which character/tag/rung, and what feels off?" : "What's your idea?"}
              className="c" style={{ width:"100%", padding:"10px 12px", borderRadius:10, background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.14)", color:"#f5f5f4", fontSize:14, outline:"none", resize:"vertical", boxSizing:"border-box" }} />

            <div className="c" style={{ fontSize:12, textTransform:"uppercase", letterSpacing:"0.15em", color:"#78716c", fontWeight:700, margin:"14px 0 8px" }}>Email (optional — if you want a reply)</div>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="you@example.com"
              className="c" style={{ width:"100%", padding:"10px 12px", borderRadius:10, background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.14)", color:"#f5f5f4", fontSize:14, outline:"none", boxSizing:"border-box" }} />

            {status === "error" && (
              <div className="c" style={{ fontSize:12, color:"#ef4444", marginTop:10 }}>
                {configured ? "Couldn't send — check your connection and try again." : "Feedback form isn't fully set up yet."}
              </div>
            )}

            <button onClick={submit} disabled={!category || !message.trim() || status==="sending"}
              className="a" style={{ marginTop:16, width:"100%", fontSize:18, padding:"14px", borderRadius:12,
                background: (!category||!message.trim()||status==="sending") ? "#44210f" : RED, color:"#fff", border:"none",
                cursor: (!category||!message.trim()||status==="sending") ? "not-allowed" : "pointer" }}>
              {status==="sending" ? "SENDING…" : "SEND FEEDBACK"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
function Fonts() {
  return <style>{`
    .a{font-family:'Anton',sans-serif} .c{font-family:'Barlow Condensed',sans-serif}
    @keyframes tIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slam{0%{opacity:0;transform:scale(1.35)}60%{transform:scale(.95)}100%{opacity:1;transform:scale(1)}}
    @keyframes spinPop{0%{opacity:0;transform:scale(.6) rotate(-8deg)}70%{transform:scale(1.06) rotate(2deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
    @keyframes reelFlash{0%,100%{opacity:1}50%{opacity:.35}}
    @keyframes clashPulse{0%{transform:scale(1)}50%{transform:scale(1.08)}100%{transform:scale(1)}}
    @keyframes vsShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
    @keyframes barGrow{from{width:0%}to{width:var(--w)}}
    @keyframes verdictPop{0%{opacity:0;transform:scale(.4)}70%{transform:scale(1.15)}100%{opacity:1;transform:scale(1)}}
    @keyframes sweep{0%{background-position:-200% 0}100%{background-position:200% 0}}
    .tIn{animation:tIn .3s ease both} .slam{animation:slam .45s cubic-bezier(.2,.8,.2,1) both}
    @keyframes spinReelActive{0%,100%{transform:scale(1) rotate(0deg);filter:brightness(1)}50%{transform:scale(1.012) rotate(-.35deg);filter:brightness(1.14)}}
    @keyframes spinLand{0%{transform:scale(.88);opacity:.25;filter:blur(4px)}55%{transform:scale(1.06);opacity:1;filter:blur(0)}100%{transform:scale(1)}}
    @keyframes slotReveal{0%{opacity:0;transform:translateY(9px) scale(.94)}65%{opacity:1;transform:translateY(-2px) scale(1.015)}100%{transform:translateY(0) scale(1)}}
    @keyframes rolePulse{0%,100%{box-shadow:0 0 0 3px rgba(255,255,255,.02)}50%{box-shadow:0 0 0 6px rgba(255,45,53,.10)}}
    .spinPop{animation:spinPop .4s cubic-bezier(.2,.9,.3,1) both}
    .spinLand{animation:spinLand .38s cubic-bezier(.2,.85,.25,1) both}
    .spinReelActive{animation:spinReelActive .34s ease-in-out infinite}
    .reel{animation:reelFlash .12s linear infinite}
    .reelRolling{filter:blur(.4px)}
    .slotReveal{animation:slotReveal .35s cubic-bezier(.2,.85,.25,1) both}
    .draftOption{animation:slotReveal .32s cubic-bezier(.2,.85,.25,1) both}
    .draftOption:nth-child(2){animation-delay:.04s}.draftOption:nth-child(3){animation-delay:.08s}.draftOption:nth-child(4){animation-delay:.12s}.draftOption:nth-child(5){animation-delay:.16s}
    @media (prefers-reduced-motion: reduce){.spinReelActive,.reel,.spinLand,.slotReveal,.draftOption,.hov{animation:none!important;transition:none!important}}
    .clash{animation:clashPulse .7s ease-in-out infinite}
    .vsShake{animation:vsShake .5s ease-in-out infinite}
    .verdictPop{animation:verdictPop .5s cubic-bezier(.2,.8,.2,1) both}
    .sweepBar{background:linear-gradient(90deg,rgba(255,45,53,.15) 25%,rgba(255,45,53,.5) 50%,rgba(255,45,53,.15) 75%);background-size:200% 100%;animation:sweep 1.1s linear infinite}
    @media(max-width:519px){.slotTags{display:none!important}}
    .redBtn:active{transform:translateY(2px)}
    .hov{transition:transform .12s,border-color .12s,box-shadow .12s}
    .hov:hover{transform:translateY(-3px);border-color:!important;box-shadow:0 10px 30px -12px rgba(255,45,53,.55)}
    .redBtn{transition:background .12s} .redBtn:hover{background:#ff474e!important}
    .ghostBtn{transition:background .12s} .ghostBtn:hover{background:rgba(255,45,53,.12)!important}
    .darkBtn{transition:background .12s} .darkBtn:hover{background:rgba(255,255,255,.10)!important}
  `}</style>;
}

function Header({ mode, onHome, onFeedback, onGuide }) {
  return (
    <header style={{ marginBottom:28, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
      <style>{`
        .hdrBtn .hdrLabel { display:none; }
        .supportBtn .supportLabel { display:inline; }
        .supportBtn { padding:7px 9px!important; font-size:11px!important; }
        @media(min-width:480px){ .hdrBtn .hdrLabel { display:inline; } .hdrBtn { padding:7px 12px!important; } }
      `}</style>
      <div style={{ display:"flex", alignItems:"center", gap:12, cursor: mode?"pointer":"default" }} onClick={mode?onHome:undefined}>
        <h1 className="a" style={{ fontSize:40, lineHeight:1, margin:0, color:"#f5f5f4", letterSpacing:"-0.5px" }}>
          ANIME<span style={{ color:RED }}>VS</span>
        </h1>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0, flexWrap:"wrap" }}>
        <button onClick={onGuide} className="c hdrBtn"
          style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, textTransform:"uppercase", letterSpacing:"0.1em",
            fontWeight:700, borderRadius:8, border:"1px solid rgba(255,255,255,0.14)",
            background:"rgba(255,255,255,0.04)", color:"#a8a29e", cursor:"pointer", whiteSpace:"nowrap" }}>
          📖<span className="hdrLabel">Guide</span>
        </button>
        <button onClick={onFeedback} className="c hdrBtn"
          style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, textTransform:"uppercase", letterSpacing:"0.1em",
            fontWeight:700, borderRadius:8, border:"1px solid rgba(255,255,255,0.14)",
            background:"rgba(255,255,255,0.04)", color:"#a8a29e", cursor:"pointer", whiteSpace:"nowrap" }}>
          💬<span className="hdrLabel">Feedback</span>
        </button>
        {/* Small, quiet support link — swap the href for your real Ko-fi page */}
        <a href="https://ko-fi.com/animevs" target="_blank" rel="noopener noreferrer"
          className="c hdrBtn supportBtn" style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, textTransform:"uppercase", letterSpacing:"0.1em",
            fontWeight:700, borderRadius:8, border:"1px solid rgba(255,45,53,0.3)",
            background:"rgba(255,45,53,0.08)", color:"#ff8a8f", textDecoration:"none", whiteSpace:"nowrap" }}>
          ☕<span className="supportLabel">Support the dev</span>
        </a>
        {mode && (
          <button onClick={onHome} className="c hdrBtn darkBtn"
            style={{ fontSize:12, textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:700, borderRadius:8,
              border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.05)", color:"#d6d3d1", cursor:"pointer" }}>
            ←<span className="hdrLabel"> Modes</span>
          </button>
        )}
      </div>
    </header>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────
// ─── PLAYER PROFILE (local only) ────────────────────────────────────────────
// Everything the home hub shows about the player lives in this browser's
// localStorage. Nothing is sent anywhere. Every read/write is try/catch'd so a
// blocked or full storage never breaks a game.
const PROFILE_KEY = "animevs-profile-v1";
const RANKS = [
  { xp:0,    name:"Rookie" },
  { xp:60,   name:"Challenger" },
  { xp:160,  name:"Contender" },
  { xp:320,  name:"Veteran" },
  { xp:600,  name:"Elite" },
  { xp:1000, name:"Master" },
  { xp:1600, name:"Legend" },
];
function emptyProfile() { return { xp:0, runs:0, bestRung:0, champions:0, reachedSum:0, spinRuns:0, draftRuns:0 }; }
function loadProfile() {
  try { return { ...emptyProfile(), ...(JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}) }; } catch (e) { return emptyProfile(); }
}
let _lastRunKey = "";
function recordRun({ key, reached, champion, kind }) {
  if (key && key === _lastRunKey) return; // StrictMode / remount guard
  _lastRunKey = key || "";
  try {
    const p = loadProfile();
    p.runs += 1;
    p.reachedSum += reached;
    p.bestRung = Math.max(p.bestRung, reached);
    if (champion) p.champions += 1;
    if (kind === "spin") p.spinRuns += 1; else if (kind === "draft") p.draftRuns += 1;
    p.xp += 10 + reached * 8 + (champion ? 100 : 0);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch (e) {}
}
function rankFor(xp) {
  let i = 0;
  for (let k = 0; k < RANKS.length; k++) if (xp >= RANKS[k].xp) i = k;
  const cur = RANKS[i], next = RANKS[i + 1] || null;
  const pct = next ? Math.round(((xp - cur.xp) / (next.xp - cur.xp)) * 100) : 100;
  return { index:i, cur, next, pct, toNext: next ? next.xp - xp : 0 };
}
function dailySnapshot() {
  let save = {};
  try { save = JSON.parse(localStorage.getItem("animevs-daily-v1")) || {}; } catch (e) {}
  const today = dayNumber();
  const doneToday = save.lastResultDay === today;
  const alive = doneToday || save.lastResultDay === today - 1;
  return { today, doneToday, streak: alive ? (save.streak || 0) : 0, best: save.best || 0 };
}

// ─── HOME HUB ───────────────────────────────────────────────────────────────
function HubIcon({ name }) {
  const common = { width:22, height:22, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:1.8, strokeLinecap:"round", strokeLinejoin:"round", "aria-hidden":true };
  if (name === "play") return <svg {...common}><path d="M7 4.5v15l12-7.5z" /></svg>;
  if (name === "roster") return <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.3c1.7.8 3 2.5 3 4.7" /></svg>;
  if (name === "guides") return <svg {...common}><path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5C4.7 19 4 18.3 4 17.5z" /><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H13v15h5.5c.8 0 1.5-.7 1.5-1.5z" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.8v.1" /></svg>;
}

function HubSectionTitle({ children, right }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", margin:"26px 2px 10px" }}>
      <div className="c" style={{ fontSize:13, textTransform:"uppercase", letterSpacing:"0.22em", color:"#a8a29e", fontWeight:700 }}>{children}</div>
      {right}
    </div>
  );
}

function Home({ setMode }) {
  const [profile] = useState(loadProfile);
  const [daily] = useState(dailySnapshot);
  const rank = rankFor(profile.xp);
  const best = Math.min(profile.bestRung, LADDER.length);
  const champion = best >= LADDER.length;
  const nextRung = champion ? LADDER[LADDER.length - 1] : LADDER[best];
  const nextTeam = nextRung.team.map(byId).filter(Boolean);
  const spot = CHARACTERS[daily.today % CHARACTERS.length];
  const spotRole = spot.role ? roleById(spot.role) : null;
  const avgRung = profile.runs ? (profile.reachedSum / profile.runs).toFixed(1) : "–";
  const firstTime = profile.runs === 0;
  const root = React.useRef(null);

  const tiles = [
    { label:"Runs", num: profile.runs },
    { label:"Best rung", num: best, suffix: `/${LADDER.length}` },
    { label:"Avg rung", num: profile.runs ? profile.reachedSum / profile.runs : 0, decimals: 1 },
    { label:"Crowns", num: profile.champions },
  ];

  // Entrance, scroll reveals and parallax. Everything is skipped for reduced motion
  // and is reverted automatically when Home unmounts.
  useGSAP(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return undefined;
    const all = Array.from(el.querySelectorAll("[data-reveal]"));
    const vh = window.innerHeight;
    const onScreen = all.filter((n) => n.getBoundingClientRect().top <= vh * 0.92);
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(onScreen, { opacity: 0, y: 24, duration: 0.6, stagger: 0.09, clearProps: "opacity,transform" })
      .from(".hub-node", { scale: 0, duration: 0.35, stagger: 0.035, ease: "back.out(2.2)", clearProps: "transform" }, 0.35)
      .from(".hub-xp", { scaleX: 0, transformOrigin: "0 50%", duration: 0.9, ease: "power2.out" }, 0.25)
      .fromTo(".hub-ring", { "--p": 0 }, { "--p": rank.pct * 3.6, duration: 1, ease: "power2.out" }, 0.25);
    const stopReveal = revealOnScroll(all);
    const stopParallax = parallax(el.querySelector(".hub-vs"), { speed: -0.1, rotate: -0.004 });
    return () => { stopReveal(); stopParallax(); };
  }, { scope: root });

  return (
    <div ref={root} className="hub" style={{ position:"relative", paddingBottom:96 }}>
      <style>{`
        @keyframes hubDriftA{0%,100%{transform:translate(-8%,-6%) scale(1)}50%{transform:translate(10%,8%) scale(1.15)}}
        @keyframes hubDriftB{0%,100%{transform:translate(8%,6%) scale(1.1)}50%{transform:translate(-10%,-8%) scale(.95)}}
        @keyframes hubPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,45,53,.55)}60%{box-shadow:0 0 0 9px rgba(255,45,53,0)}}
        @keyframes hubFlame{0%,100%{transform:scale(1) rotate(-2deg)}50%{transform:scale(1.12) rotate(3deg)}}
        .hubGrid2{display:grid;grid-template-columns:1fr;gap:14px}
        @media(min-width:720px){.hubGrid2{grid-template-columns:1fr 1fr}}
        .hubPath::-webkit-scrollbar{display:none}
        .hubBtn{transition:transform .12s,filter .12s,box-shadow .12s}
        .hubBtn:hover{transform:translateY(-2px);filter:brightness(1.08)}
        .hubBtn:active{transform:translateY(1px)}
        .hubTab{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 4px;border-radius:12px;text-decoration:none;flex:1;min-width:0}
        .hubTab:hover{background:rgba(255,255,255,.05)}
        @media(prefers-reduced-motion:reduce){.hubBlob,.hubNext,.hubFlame{animation:none!important}.hubBtn{transition:none!important}}
      `}</style>

      {/* ambient backdrop */}
      <div aria-hidden="true" style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
        <div className="hubBlob" style={{ position:"absolute", top:"-10%", left:"-15%", width:"70vmax", height:"70vmax", borderRadius:"50%",
          background:"radial-gradient(circle, rgba(255,45,53,0.13), transparent 62%)", animation:"hubDriftA 22s ease-in-out infinite" }} />
        <div className="hubBlob" style={{ position:"absolute", bottom:"-20%", right:"-20%", width:"75vmax", height:"75vmax", borderRadius:"50%",
          background:"radial-gradient(circle, rgba(168,85,247,0.12), transparent 62%)", animation:"hubDriftB 28s ease-in-out infinite" }} />
        <div className="a hub-vs" style={{ position:"absolute", right:"-4%", top:"18%", fontSize:"46vmin", lineHeight:1, color:"rgba(255,255,255,0.02)", transform:"rotate(-8deg)", userSelect:"none" }}>VS</div>
      </div>

      <div style={{ position:"relative", zIndex:1 }}>
        {/* tagline + profile strip */}
        <p data-reveal className="c" style={{ margin:"-8px 2px 16px", fontSize:16, letterSpacing:"0.18em", textTransform:"uppercase", color:"#a8a29e" }}>
          Draft seven. Counter the rival. <ShinyText text="Climb ten rungs." color={RED} shineColor="#ffd9db" speed={2.4} delay={2.5} shineWidth={34} style={{ fontWeight:700 }} />
        </p>

        <div data-reveal style={{ display:"flex", alignItems:"center", gap:14, padding:14, borderRadius:16, border:"1px solid rgba(255,255,255,0.10)", background:"linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))" }}>
          <div className="hub-ring" style={{ position:"relative", width:58, height:58, flexShrink:0, borderRadius:"50%", "--p": rank.pct * 3.6,
            background:`conic-gradient(${RED} calc(var(--p) * 1deg), rgba(255,255,255,0.10) 0)`, display:"grid", placeItems:"center" }}>
            <div className="a" style={{ width:48, height:48, borderRadius:"50%", background:INK, display:"grid", placeItems:"center", fontSize:22, color:"#f5f5f4" }}>
              {rank.cur.name[0]}
            </div>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:8, flexWrap:"wrap" }}>
              <span className="a" style={{ fontSize:22, color:"#f5f5f4", lineHeight:1.1 }}>{rank.cur.name}</span>
              <span className="c" style={{ fontSize:13, color:"#a8a29e" }}><CountUp to={profile.xp} duration={1.1} /> XP</span>
            </div>
            <div style={{ height:6, borderRadius:99, background:"rgba(255,255,255,0.10)", margin:"7px 0 5px", overflow:"hidden" }}>
              <div className="hub-xp" style={{ width:`${rank.pct}%`, height:"100%", background:RED, borderRadius:99 }} />
            </div>
            <div className="c" style={{ fontSize:12, color:"#78716c" }}>
              {rank.next ? `${rank.toNext} XP to ${rank.next.name}` : "Top rank reached"}
            </div>
          </div>
          <div title="Daily puzzle streak" style={{ textAlign:"center", padding:"8px 12px", borderRadius:12, border:"1px solid rgba(251,191,36,0.3)", background:"rgba(251,191,36,0.07)", flexShrink:0 }}>
            <div className="hubFlame" style={{ fontSize:20, lineHeight:1, animation: daily.streak ? "hubFlame 1.6s ease-in-out infinite" : "none", filter: daily.streak ? "none" : "grayscale(1) opacity(.5)" }}>🔥</div>
            <div className="a" style={{ fontSize:20, color: daily.streak ? "#fbbf24" : "#57534e", lineHeight:1.1 }}>{daily.streak}</div>
          </div>
        </div>

        {/* ladder hero */}
        <SpotlightCard data-reveal spotlightColor="#ff7a80" intensity={0.2} spotlightSize={280}
          style={{ marginTop:16, borderRadius:20, padding:"20px 18px 18px", "--spotlight-card-surface":"transparent", "--spotlight-card-border":"transparent", "--spotlight-card-shadow":"none",
            border:"1px solid rgba(255,45,53,0.35)", background:"linear-gradient(150deg, rgba(255,45,53,0.24), rgba(60,10,14,0.55) 55%, rgba(11,12,16,0.9))" }}>
          <div className="a" aria-hidden="true" style={{ position:"absolute", right:-8, top:-22, fontSize:120, lineHeight:1, color:"rgba(255,255,255,0.045)", userSelect:"none" }}>{String(nextRung.rung).padStart(2, "0")}</div>
          <div style={{ position:"relative" }}>
            <div className="c" style={{ fontSize:12, letterSpacing:"0.24em", textTransform:"uppercase", color:"#fecaca", fontWeight:700 }}>
              {champion ? "The ladder · defend your crown" : firstTime ? "The ladder · start here" : `The ladder · rung ${nextRung.rung} of ${LADDER.length}`}
            </div>
            <div className="a" style={{ fontSize:34, lineHeight:1.05, margin:"6px 0 2px", color:"#fff" }}>{nextRung.title}</div>
            <div className="c" style={{ fontSize:15, color:"#e7c8ca" }}>
              {nextRung.universe} · opponent strength ×{nextRung.boost.toFixed(2)}
            </div>

            {/* rung path */}
            <div className="hubPath" style={{ display:"flex", alignItems:"center", margin:"16px -4px 4px", padding:"6px 4px", overflowX:"auto", scrollbarWidth:"none" }}>
              {LADDER.map((r, i) => {
                const cleared = r.rung <= best;
                const isNext = !champion && r.rung === best + 1;
                return (
                  <React.Fragment key={r.rung}>
                    <div title={`Rung ${r.rung}: ${r.title} (${r.universe})`} className={`hub-node${isNext ? " hubNext" : ""}`}
                      style={{ flex:"0 1 28px", minWidth:20, aspectRatio:"1", boxSizing:"border-box", borderRadius:"50%", display:"grid", placeItems:"center", fontSize:12, fontWeight:800,
                        fontFamily:"'Barlow Condensed',sans-serif",
                        background: cleared ? RED : isNext ? "rgba(255,45,53,0.18)" : "rgba(0,0,0,0.35)",
                        border: cleared ? `2px solid ${RED}` : isNext ? `2px solid ${RED}` : "2px solid rgba(255,255,255,0.14)",
                        color: cleared ? "#fff" : isNext ? "#fecaca" : "#78716c",
                        animation: isNext ? "hubPulse 1.8s ease-out infinite" : "none" }}>
                      {cleared ? "✓" : r.rung}
                    </div>
                    {i < LADDER.length - 1 && <div style={{ flex:"1 1 3px", minWidth:3, height:2, background: r.rung < best + (champion ? 1 : 0) ? RED : "rgba(255,255,255,0.12)" }} />}
                  </React.Fragment>
                );
              })}
            </div>

            {/* opponent squad preview */}
            <div style={{ marginTop:12, padding:"10px 12px", borderRadius:12, background:"rgba(0,0,0,0.38)", border:"1px solid rgba(255,255,255,0.08)" }}>
              <div className="c" style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:"#a8a29e", marginBottom:6 }}>Their squad</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {nextTeam.slice(0, 5).map((c) => (
                  <span key={c.id} className="c" style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:13, fontWeight:700, color:"#e7e5e4", padding:"3px 8px 3px 5px", borderRadius:8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)" }}>
                    <TierBadge tier={c.tier} small />{c.name}
                  </span>
                ))}
                {nextTeam.length > 5 && <span className="c" style={{ fontSize:13, color:"#a8a29e", alignSelf:"center" }}>+{nextTeam.length - 5} more</span>}
              </div>
            </div>

            <div style={{ display:"flex", gap:10, marginTop:16 }}>
              <Magnet padding={50} magnetStrength={5} style={{ flex:1, display:"block" }}>
                <button onClick={() => setMode("spin")} className="a hubBtn"
                  style={{ width:"100%", padding:"14px 10px", fontSize:20, letterSpacing:"0.04em", borderRadius:12, border:"none", cursor:"pointer", background:"#fff", color:INK, boxShadow:"0 4px 0 #b9b9b9" }}>
                  ▶ SPIN
                </button>
              </Magnet>
              <Magnet padding={50} magnetStrength={5} style={{ flex:1, display:"block" }}>
                <button onClick={() => setMode("draft")} className="a hubBtn"
                  style={{ width:"100%", padding:"14px 10px", fontSize:20, letterSpacing:"0.04em", borderRadius:12, border:"1px solid rgba(255,255,255,0.28)", cursor:"pointer", background:"rgba(255,255,255,0.10)", color:"#fff", boxShadow:"0 4px 0 rgba(0,0,0,0.35)" }}>
                  DRAFT
                </button>
              </Magnet>
            </div>
            <div className="c" style={{ fontSize:12, color:"#d4a5a8", marginTop:10 }}>
              Spin: take what the reel gives you. Draft: five draws per pick on a 50-credit budget.
            </div>
          </div>
        </SpotlightCard>

        {/* versus + daily */}
        <section data-reveal>
        <HubSectionTitle>Play someone</HubSectionTitle>
        <div className="hubGrid2">
          <SpotlightCard role="button" tabIndex={0} onClick={() => setMode("pvp")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMode("pvp"); } }}
            spotlightColor="#ffffff" intensity={0.22}
            style={{ textAlign:"left", cursor:"pointer", color:"#fff", padding:"18px 18px", borderRadius:18, "--spotlight-card-surface":"transparent", "--spotlight-card-border":"rgba(255,255,255,0.14)", "--spotlight-card-shadow":"none",
              background:"linear-gradient(120deg, #4f2bd6 0%, #a855f7 55%, #ec4899 100%)" }}>
            <div className="a" aria-hidden="true" style={{ position:"absolute", right:10, top:-6, fontSize:78, lineHeight:1, color:"rgba(255,255,255,0.14)" }}>VS</div>
            <div style={{ position:"relative" }}>
              <div className="a" style={{ fontSize:26, lineHeight:1.1 }}>Challenge a friend</div>
              <div className="c" style={{ fontSize:15, color:"#f3e8ff", margin:"4px 0 10px", maxWidth:300 }}>Live two-player rooms. Build blind, or bid against your rival in an auction.</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {["Blind draft", "Live auction · $50"].map((t) => (
                  <span key={t} className="c" style={{ fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", padding:"3px 9px", borderRadius:99, background:"rgba(0,0,0,0.28)", border:"1px solid rgba(255,255,255,0.25)" }}>{t}</span>
                ))}
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard role="button" tabIndex={0} onClick={() => setMode("daily")} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMode("daily"); } }}
            spotlightColor="#fbbf24" intensity={0.2}
            style={{ textAlign:"left", cursor:"pointer", color:"#e7e5e4", padding:"18px 18px", borderRadius:18, "--spotlight-card-surface":"transparent", "--spotlight-card-shadow":"none",
              "--spotlight-card-border": daily.doneToday ? "rgba(34,197,94,0.4)" : "rgba(251,191,36,0.4)",
              background:`linear-gradient(150deg, ${daily.doneToday ? "rgba(34,197,94,0.14)" : "rgba(251,191,36,0.16)"}, rgba(255,255,255,0.02) 70%)` }}>
            <div className="c" style={{ fontSize:12, letterSpacing:"0.22em", textTransform:"uppercase", color: daily.doneToday ? "#86efac" : "#fcd34d", fontWeight:700 }}>
              Daily puzzle #{daily.today}
            </div>
            <div className="a" style={{ fontSize:26, lineHeight:1.1, margin:"5px 0 4px", color:"#f5f5f4" }}>
              {daily.doneToday ? "Done for today ✓" : "Who's the mystery fighter?"}
            </div>
            <div className="c" style={{ fontSize:15, color:"#a8a29e" }}>
              {daily.doneToday ? "Come back tomorrow for a new one." : "Seven guesses. Same puzzle for everyone, every day."}
            </div>
            <div className="c" style={{ marginTop:10, fontSize:13, color:"#fbbf24", fontWeight:700 }}>
              {daily.streak ? `🔥 ${daily.streak}-day streak` : "Start a streak"}{daily.best > 1 ? ` · best ${daily.best}` : ""}
            </div>
          </SpotlightCard>
        </div>

        </section>

        {/* record */}
        <section data-reveal>
        <HubSectionTitle right={<span className="c" style={{ fontSize:12, color:"#57534e" }}>saved on this device</span>}>Your record</HubSectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8 }}>
          {tiles.map((t) => (
            <div key={t.label} style={{ textAlign:"center", padding:"12px 4px", borderRadius:14, border:"1px solid rgba(255,255,255,0.09)", background:"rgba(255,255,255,0.03)" }}>
              <div className="a" style={{ fontSize:24, lineHeight:1.1, color: t.num ? "#f5f5f4" : "#57534e" }}>
                {t.num ? <CountUp to={t.num} decimals={t.decimals || 0} suffix={t.suffix || ""} duration={1.2} /> : "–"}
              </div>
              <div className="c" style={{ fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", color:"#a8a29e", marginTop:3 }}>{t.label}</div>
            </div>
          ))}
        </div>
        {firstTime && <p className="c" style={{ fontSize:13, color:"#78716c", margin:"8px 2px 0" }}>Finish a Spin or Draft run and your rank, best rung and averages start filling in here.</p>}

        </section>

        {/* spotlight */}
        <section data-reveal>
        <HubSectionTitle right={<a href="/characters" className="c" style={{ fontSize:13, color:"#fca5a5", textDecoration:"none", fontWeight:700 }}>All {CHARACTERS.length} fighters →</a>}>Fighter spotlight</HubSectionTitle>
        <SpotlightCard spotlightColor={TIER_COLOR[spot.tier] || "#ffffff"} intensity={0.16}
          style={{ padding:16, borderRadius:18, "--spotlight-card-surface":"transparent", "--spotlight-card-border":"rgba(255,255,255,0.12)", "--spotlight-card-shadow":"none",
            background:"linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))", display:"flex", gap:14, alignItems:"flex-start" }}>
          <div className="a" style={{ flexShrink:0, width:64, height:84, borderRadius:12, display:"grid", placeItems:"center", fontSize:34, color:INK,
            background:`linear-gradient(160deg, ${TIER_COLOR[spot.tier] || "#a8a29e"}, ${TIER_COLOR[spot.tier] || "#a8a29e"}88)`, boxShadow:`0 8px 24px -10px ${TIER_COLOR[spot.tier] || "#a8a29e"}` }}>
            {spot.name[0]}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <TierBadge tier={spot.tier} />
              <span className="a" style={{ fontSize:24, color:"#f5f5f4", lineHeight:1.1 }}>{spot.name}</span>
              <span className="c" style={{ fontSize:15, color:"#a8a29e" }}>{spot.rating}</span>
            </div>
            <div className="c" style={{ fontSize:14, color:"#a8a29e", margin:"2px 0 8px" }}>
              {spot.series} · {spot.cost} credits{spotRole ? <> · best as <span style={{ color:spotRole.color, fontWeight:700 }}>{spotRole.name}</span></> : null}
            </div>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:8 }}>{spot.tags.slice(0, 6).map((t) => <Tag key={t} t={t} small />)}</div>
            <AbilityChip ability={spot.ability} small />
          </div>
        </SpotlightCard>

        </section>

        {/* roles */}
        <section data-reveal>
        <HubSectionTitle>The seven roles</HubSectionTitle>
        <div style={{ padding:16, borderRadius:14, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.02)" }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {ROLES.map((r) => (
              <div key={r.id} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 10px", borderRadius:8, background:"rgba(0,0,0,0.35)", border:`1px solid ${r.color}55` }}>
                <span style={{ height:8, width:8, borderRadius:99, background:r.color }} />
                <span className="c" style={{ fontWeight:700, fontSize:14, color:"#e7e5e4" }}>{r.name}</span>
                <span className="c" style={{ fontSize:12, color:"#a8a29e" }}>· {r.blurb}</span>
              </div>
            ))}
          </div>
          <p className="c" style={{ fontSize:13, color:"#78716c", margin:"10px 0 0" }}>
            Fit a character's tags to its role for a bonus. Force a misfit and they underperform.
          </p>
        </div>

        </section>

        {/* guides */}
        <section data-reveal>
        <HubSectionTitle>Guides &amp; strategy</HubSectionTitle>
        <nav aria-label="Guides and site info" style={{ padding:16, borderRadius:14, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.02)" }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 16px" }}>
            {[["/guides/how-to-play","How to play"],["/guides/scoring","How scoring works"],["/guides/counters","Counters"],["/guides/ladder","Ladder guide"],["/guides/budget-strategy","Budget strategy"],["/characters","Character database"]].map(([href, label]) => (
              <a key={href} href={href} className="c" style={{ color:"#e7e5e4", fontSize:15, fontWeight:600, textDecoration:"underline", textUnderlineOffset:3 }}>{label}</a>
            ))}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 16px", marginTop:12 }}>
            {[["/about","About"],["/privacy","Privacy"],["/contact","Contact"]].map(([href, label]) => (
              <a key={href} href={href} className="c" style={{ color:"#a8a29e", fontSize:13 }}>{label}</a>
            ))}
          </div>
        </nav>
        </section>
      </div>

      {/* bottom tab bar */}
      <div style={{ position:"fixed", left:0, right:0, bottom:0, zIndex:40, background:"rgba(11,12,16,0.94)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", borderTop:"1px solid rgba(255,255,255,0.10)" }}>
        <div style={{ maxWidth:1024, margin:"0 auto", display:"flex", padding:"4px 12px calc(4px + env(safe-area-inset-bottom, 0px))" }}>
          {[["play","Play","#",true],["roster","Roster","/characters"],["guides","Guides","/guides"],["about","About","/about"]].map(([icon, label, href, active]) => (
            <a key={label} href={href} className="hubTab c"
              onClick={active ? (e) => { e.preventDefault(); smoothScrollToTop(); } : undefined}
              style={{ color: active ? RED : "#a8a29e", background: active ? "rgba(255,45,53,0.10)" : "transparent" }}>
              <HubIcon name={icon} />
              <span style={{ fontSize:12, fontWeight:700, letterSpacing:"0.06em" }}>{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── shared bits ────────────────────────────────────────────────────────────
function Tag({ t, small }) {
  const s = TAG_STYLE[t] || { bg:"#292524", fg:"#d6d3d1", bd:"#57534e" };
  return <span className="c" style={{ fontSize: small?10:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
    padding: small?"1px 6px":"2px 8px", borderRadius:999, background:s.bg, color:s.fg, border:`1px solid ${s.bd}66` }}>{t}</span>;
}
function SideTitle({ children }) {
  return <div className="c" style={{ textTransform:"uppercase", letterSpacing:"0.25em", fontSize:12, fontWeight:700, color:RED, borderBottom:"1px solid rgba(255,255,255,0.12)", paddingBottom:6 }}>{children}</div>;
}
function AbilityChip({ ability, small }) {
  if (!ability) return null;
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding: small?"2px 8px":"4px 10px", borderRadius:8,
      background:"rgba(168,85,247,0.12)", border:"1px solid rgba(168,85,247,0.4)", maxWidth:"100%" }}>
      <span style={{ fontSize: small?11:12, filter:"grayscale(.2)" }}>✦</span>
      <span className="c" style={{ fontWeight:700, fontSize: small?12:13, color:"#d8b4fe" }}>{ability.name}</span>
      <span className="c" style={{ fontSize: small?10:11, color:"#a8a29e" }}>· {abilityText(ability)}</span>
    </div>
  );
}
function SignatureHint({ character }) {
  if (!character || !character.role) return null;
  const role = roleById(character.role);
  if (!role) return null;
  return (
    <div className="c" style={{ marginTop:8, fontSize:12, color:"#a8a29e" }}>
      Best as <span style={{ color:role.color, fontWeight:700 }}>{role.name}</span> · signature role bonus
    </div>
  );
}

// role slot chip used by both modes
function RoleSlot({ role, member, active, onClick, disabled }) {
  const fit = member ? roleFit(member.character, role.id) : null;
  const fitColor = fit ? (fit.tone==="great"?"#22c55e":fit.tone==="good"?"#eab308":"#ef4444") : "#57534e";
  return (
    <button onClick={onClick} disabled={disabled}
      className={active ? "" : "hov"}
      style={{ textAlign:"left", padding:12, borderRadius:12, width:"100%", cursor: disabled?"default":"pointer", color:"#e7e5e4",
        border: active ? `2px solid ${role.color}` : member ? "1px solid rgba(255,255,255,0.14)" : "1px dashed rgba(255,255,255,0.18)",
        background: active ? `${role.color}18` : member ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)",
        boxShadow: active ? `0 0 0 3px ${role.color}22` : "none",
        animation: active ? "rolePulse 1.25s ease-in-out infinite" : "none" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom: member?8:0 }}>
        <span style={{ height:10, width:10, borderRadius:99, background:role.color }} />
        <span className="c" style={{ fontWeight:700, fontSize:15, color:"#f5f5f4" }}>{role.name}</span>
        <span className="c" style={{ fontSize:12, color:"#a8a29e" }}>· {role.blurb}</span>
      </div>
      {member ? (
        <div key={member.character.id} className="slotReveal">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ display:"flex", alignItems:"center", gap:6 }}>
              <TierBadge tier={member.character.tier} small />
              <span className="c" style={{ fontWeight:700, fontSize:16, color:"#f5f5f4" }}>{member.character.name}</span>
            </span>
            <span className="a" style={{ fontSize:22, color:fitColor }}>{fittedRating(member.character, role.id)}</span>
          </div>
          <div style={{ marginTop:2, marginBottom:4 }}>
            <div className="c" style={{ fontSize:11, fontWeight:700, color:fitColor, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:2 }}>{fit.label}</div>
            <div className="c" style={{ fontSize:11, color:"#78716c", marginBottom:4 }}>
              {member.character.rating} base{fit.bonus>0 && ` + ${fit.bonus} fit`} = {fittedRating(member.character, role.id)}
            </div>
            <div className="slotTags" style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{member.character.tags.map((t)=><Tag key={t} t={t} small />)}</div>
          </div>
          <AbilityChip ability={member.character.ability} small />
        </div>
      ) : (
        <div className="c" style={{ fontSize:12, color:"#57534e", textTransform:"uppercase", letterSpacing:"0.15em", marginTop:4 }}>
          {active ? "Placing here…" : "Empty"}
        </div>
      )}
    </button>
  );
}

// The result / climb screen shared by both modes. team = [{character, roleId}]
// Staged battle reveal: plays through each attempted rung with suspense, then
// hands off to the full results screen. Skippable.
function BattleSequence({ team, run, onDone }) {
  const { rungs, reached, champion } = run;
  const attempted = rungs.filter((r) => r.attempted);
  const [idx, setIdx] = useState(0);
  const [showVerdict, setShowVerdict] = useState(false);

  const cur = attempted[idx];

  React.useEffect(() => {
    if (!cur) { onDone(); return; }
    setShowVerdict(false);
    const t1 = setTimeout(() => setShowVerdict(true), 1100);   // "battle in progress" then reveal
    const t2 = setTimeout(() => {
      if (idx + 1 < attempted.length && cur.cleared) setIdx(idx + 1);
      else onDone();                                            // stop on final rung or a loss
    }, 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [idx, cur]);

  if (!cur) return null;

  const myTotal = cur.me.total, oppTotal = cur.them.total;
  const total = myTotal + oppTotal;
  const myPct = Math.max(8, Math.min(92, (myTotal / total) * 100));
  const roleColor = "#a855f7";

  return (
    <div className="tIn" style={{ maxWidth:640, margin:"0 auto", textAlign:"center" }}>
      {/* progress dots */}
      <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:24 }}>
        {rungs.map((r,i) => {
          const done = attempted.indexOf(r) > -1 && attempted.indexOf(r) < idx;
          const active = r === cur;
          const doneCleared = done && r.cleared;
          return <div key={r.rung} style={{ height:6, width: active?24:12, borderRadius:999, transition:"all .3s",
            background: active ? "#fbbf24" : doneCleared ? RED : done ? "#57534e" : "rgba(255,255,255,0.10)" }} />;
        })}
      </div>

      <div className="c" style={{ textTransform:"uppercase", letterSpacing:"0.3em", fontSize:13, color:"#fbbf24", marginBottom:4 }}>
        Rung {cur.rung} of {LADDER.length}
      </div>
      <div className="a" style={{ fontSize:34, color:"#f5f5f4", lineHeight:1.05, marginBottom:2, minHeight:36 }}>
        <Suspense fallback={cur.title}>
          <SplitText key={cur.rung} text={cur.title} tag="span" trigger="load" splitType="chars" effect="rise" delay={26} duration={0.8} textAlign="center" />
        </Suspense>
      </div>
      <div className="c" style={{ fontSize:14, color:"#a8a29e", marginBottom:24 }}>{cur.universe} · ⚡{cur.boost.toFixed(2)}</div>

      {/* the clash */}
      <div style={{ position:"relative", borderRadius:16, padding:"32px 20px", marginBottom:20, overflow:"hidden",
        border:"1px solid rgba(255,255,255,0.12)", background:"linear-gradient(160deg,#17181d,#0b0c10 70%)" }}>
        {!showVerdict ? (
          <div className="clash">
            <div className="a vsShake" style={{ fontSize:60, lineHeight:1, color:"#f5f5f4" }}>VS</div>
            <div className="c" style={{ marginTop:12, fontSize:16, color:"#a8a29e", letterSpacing:"0.15em", textTransform:"uppercase" }}>Battle in progress…</div>
            <div style={{ height:6, borderRadius:999, marginTop:16, overflow:"hidden", background:"rgba(255,255,255,0.06)" }}>
              <div className="sweepBar" style={{ height:"100%", width:"100%" }} />
            </div>
          </div>
        ) : (
          <div className="verdictPop">
            <div className="a" style={{ fontSize:44, lineHeight:1, color: cur.cleared ? "#4ade80" : "#f87171" }}>
              <Suspense fallback={cur.cleared ? "CLEARED" : "DEFEATED"}>
                <SplitText key={`${cur.rung}-${cur.cleared}`} text={cur.cleared ? "CLEARED" : "DEFEATED"} tag="span" trigger="load" splitType="chars" effect="pop" delay={34} duration={0.7} textAlign="center" color={cur.cleared ? "#4ade80" : "#f87171"} />
              </Suspense>
            </div>
            {/* score bar */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:18 }}>
              <span className="a" style={{ fontSize:22, color:"#f5f5f4", minWidth:60, textAlign:"right" }}>{myTotal.toFixed(0)}</span>
              <div style={{ flex:1, height:14, borderRadius:999, overflow:"hidden", display:"flex", background:"#44403c" }}>
                <div style={{ width:myPct+"%", background: cur.cleared?RED:"#78716c", transition:"width .6s ease" }} />
                <div style={{ flex:1, background:"#3a3a3a" }} />
              </div>
              <span className="a" style={{ fontSize:22, color:"#a8a29e", minWidth:60, textAlign:"left" }}>{oppTotal.toFixed(0)}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
              <span className="c" style={{ fontSize:12, color:"#f5f5f4", textTransform:"uppercase", letterSpacing:"0.1em" }}>Your squad</span>
              <span className="c" style={{ fontSize:12, color:"#a8a29e", textTransform:"uppercase", letterSpacing:"0.1em" }}>{cur.title}</span>
            </div>
            {cur.me.edges.length > 0 && (
              <div className="c" style={{ fontSize:12, color:"#6ee7b7", marginTop:10 }}>+{cur.me.bonus} {cur.me.edges.join(", ")}</div>
            )}
            {cur.me.duos && cur.me.duos.length > 0 && (
              <div className="c" style={{ fontSize:12, color:"#fbbf24", marginTop:4 }}>+{cur.me.duoBonus} synergy · {cur.me.duos.join(", ")}</div>
            )}
          </div>
        )}
      </div>

      <button onClick={onDone} className="c darkBtn"
        style={{ textTransform:"uppercase", letterSpacing:"0.2em", fontSize:13, fontWeight:700, padding:"10px 24px", borderRadius:10,
          border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.05)", color:"#a8a29e", cursor:"pointer" }}>
        Skip to results →
      </button>
    </div>
  );
}

// Landing view for a shared result link (?result=CODE). Read-only snapshot of
// someone else's climb, with a clear call to action to build your own team.
function SharedResultView({ setMode }) {
  const [decoded, setDecoded] = useState(null); // {team, reached} | null (loading) 
  const [error, setError] = useState("");

  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("result");
      const res = decodeResult((code || "").trim());
      if (res.error) setError(res.error);
      else setDecoded(res);
    } catch (e) { setError("Could not read that result link."); }
  }, []);

  function playNow() {
    try { window.history.replaceState({}, "", window.location.pathname); } catch (e) {}
    setMode(null);
  }

  if (error) {
    return (
      <div className="tIn" style={{ maxWidth:480, margin:"60px auto", textAlign:"center" }}>
        <div className="a" style={{ fontSize:26, color:"#f5f5f4", marginBottom:8 }}>LINK UNREADABLE</div>
        <p className="c" style={{ color:"#a8a29e", marginBottom:20 }}>{error}</p>
        <button onClick={playNow} className="a redBtn" style={{ padding:"14px 28px", borderRadius:12, background:RED, color:"#fff", border:"none", cursor:"pointer", fontSize:17 }}>
          Play animeVS →
        </button>
      </div>
    );
  }
  if (!decoded) return null; // brief flash while decoding

  const { team, reached } = decoded;
  const champion = reached === LADDER.length;

  return (
    <div className="tIn" style={{ maxWidth:640, margin:"0 auto" }}>
      <div className="c" style={{ textAlign:"center", fontSize:13, color:"#a8a29e", marginBottom:16, textTransform:"uppercase", letterSpacing:"0.15em" }}>
        A friend's animeVS run
      </div>
      <div className="slam" style={{ position:"relative", overflow:"hidden", borderRadius:16, padding:32, marginBottom:20,
        border: champion?`1px solid ${RED}`:"1px solid rgba(255,255,255,0.12)",
        background: champion?"linear-gradient(160deg,#2a1608,#0b0c10 60%)":"linear-gradient(160deg,#17181d,#0b0c10 60%)" }}>
        <div className="a" style={{ position:"absolute", right:-16, top:-24, fontSize:130, lineHeight:1, color:"rgba(255,255,255,0.035)", userSelect:"none" }}>VS</div>
        <div style={{ position:"relative" }}>
          <div className="c" style={{ textTransform:"uppercase", letterSpacing:"0.3em", fontSize:12, color:"#a8a29e", marginBottom:4 }}>animeVS</div>
          <div className="a" style={{ fontSize:52, lineHeight:1, marginBottom:8, color: champion?"#fbbf24":"#f5f5f4" }}>
            {champion?"CHAMPION":`RUNG ${reached}`}{!champion && <span style={{ color:"#78716c", fontSize:30 }}>/{LADDER.length}</span>}
          </div>
          <p className="c" style={{ color:"#a8a29e", marginBottom:20, fontSize:16 }}>
            {champion?"Toppled every dynasty. Flawless run.":reached===0?"Fell at the first gate.":`Climbed ${reached} before the wall.`}
          </p>
          <div style={{ display:"flex", gap:6, marginBottom:20 }}>
            {LADDER.map((r)=><div key={r.rung} style={{ height:8, flex:1, borderRadius:999, background: r.rung>reached?"rgba(255,255,255,0.09)":RED }} />)}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {team.map(m=>(
              <span key={m.roleId} className="c" style={{ fontSize:13, padding:"3px 9px", borderRadius:6, background:"rgba(0,0,0,0.45)", border:`1px solid ${roleById(m.roleId).color}55`, color:"#d6d3d1" }}>
                <span style={{ color:roleById(m.roleId).color, fontWeight:700 }}>{roleById(m.roleId).name}:</span> {m.character.name} {fittedRating(m.character,m.roleId)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign:"center", borderRadius:16, padding:"28px 20px", border:"1px solid rgba(255,45,53,0.3)", background:"rgba(255,45,53,0.06)" }}>
        <div className="a" style={{ fontSize:24, color:"#f5f5f4", marginBottom:6 }}>Think you can do better?</div>
        <p className="c" style={{ color:"#a8a29e", fontSize:14, marginBottom:18 }}>Draft your own 7-fighter squad and climb the same 10-rung gauntlet.</p>
        <button onClick={playNow} className="a redBtn" style={{ padding:"14px 32px", borderRadius:12, background:RED, color:"#fff", border:"none", cursor:"pointer", fontSize:18, boxShadow:"0 8px 30px -8px rgba(255,45,53,0.7)" }}>
          Build your own team →
        </button>
      </div>
    </div>
  );
}

function ClimbResult({ team, onReplay, replayLabel }) {
  const run = useMemo(() => {
    let reached = 0;
    const rungs = LADDER.map((r) => {
      const res = resolveRung(team, r);
      const attempted = reached === r.rung - 1;
      if (attempted && res.cleared) reached = r.rung;
      return { ...r, ...res, attempted };
    });
    return { rungs, reached, champion: reached === LADDER.length };
  }, [team]);
  const { rungs, reached, champion } = run;
  const [phase, setPhase] = useState("battle"); // battle | results
  React.useEffect(() => {
    recordRun({ key: team.map((m) => m.character.id).join("|"), reached, champion, kind: replayLabel === "NEW SPIN" ? "spin" : replayLabel === "NEW DRAFT" ? "draft" : "" });
  }, [run]);
  const [copied, setCopied] = useState(false);
  const resRef = React.useRef(null);

  // Results entrance. This hook sits above the early return below so the hook order
  // never changes between the battle and results phases.
  useGSAP(() => {
    if (phase !== "results" || !resRef.current || prefersReducedMotion()) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".res-pip", { scaleY: 0, transformOrigin: "50% 100%", duration: 0.4, stagger: 0.05 }, 0.15)
      .from(".res-chip", { opacity: 0, y: 10, duration: 0.35, stagger: 0.04, clearProps: "opacity,transform" }, 0.3)
      .from(".res-actions", { opacity: 0, y: 14, duration: 0.45, clearProps: "opacity,transform" }, 0.5)
      .from(".res-row", { opacity: 0, y: 22, duration: 0.5, stagger: 0.06, clearProps: "opacity,transform" }, 0.6);
  }, { scope: resRef, dependencies: [phase] });

  if (phase === "battle") {
    return <BattleSequence team={team} run={run} onDone={() => setPhase("results")} />;
  }

  function shareLink(){
    const code = encodeResult(team, reached);
    if (!code) return;
    let url = code;
    try { url = `${window.location.origin}${window.location.pathname}?result=${code}`; } catch (e) {}
    navigator.clipboard?.writeText(url).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1800);});
  }

  return (
    <div ref={resRef} style={{ maxWidth:640, margin:"0 auto" }}>
      <div className="slam" style={{ position:"relative", overflow:"hidden", borderRadius:16, padding:32, marginBottom:20,
        border: champion?`1px solid ${RED}`:"1px solid rgba(255,255,255,0.12)",
        background: champion?"linear-gradient(160deg,#2a1608,#0b0c10 60%)":"linear-gradient(160deg,#17181d,#0b0c10 60%)" }}>
        <div className="a" style={{ position:"absolute", right:-16, top:-24, fontSize:130, lineHeight:1, color:"rgba(255,255,255,0.035)", userSelect:"none" }}>VS</div>
        <div style={{ position:"relative" }}>
          <div className="c" style={{ textTransform:"uppercase", letterSpacing:"0.3em", fontSize:12, color:"#a8a29e", marginBottom:4 }}>animeVS</div>
          <div className="a" style={{ fontSize:52, lineHeight:1, marginBottom:8, color: champion?"#fbbf24":"#f5f5f4" }}>
            {champion?"CHAMPION":<>RUNG <CountUp to={reached} duration={0.9} delay={0.2} /></>}{!champion && <span style={{ color:"#78716c", fontSize:30 }}>/{LADDER.length}</span>}
          </div>
          <p className="c" style={{ color:"#a8a29e", marginBottom:20, fontSize:16 }}>
            {champion?"Toppled every dynasty. Flawless run.":reached===0?"Fell at the first gate.":`Climbed ${reached} before the wall.`}
          </p>
          <div style={{ display:"flex", gap:6, marginBottom:20 }}>
            {rungs.map(r=><div key={r.rung} className="res-pip" style={{ height:8, flex:1, borderRadius:999, background:!r.attempted?"rgba(255,255,255,0.09)":r.cleared?RED:"#44403c" }} />)}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {team.map(m=>(
              <span key={m.roleId} className="c res-chip" style={{ fontSize:13, padding:"3px 9px", borderRadius:6, background:"rgba(0,0,0,0.45)", border:`1px solid ${roleById(m.roleId).color}55`, color:"#d6d3d1" }}>
                <span style={{ color:roleById(m.roleId).color, fontWeight:700 }}>{roleById(m.roleId).name}:</span> {m.character.name} {fittedRating(m.character,m.roleId)}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="res-actions" style={{ display:"flex", gap:12, marginBottom:24 }}>
        <button onClick={shareLink} className="c darkBtn" style={{ flex:1, textTransform:"uppercase", letterSpacing:"0.15em", fontSize:14, fontWeight:700, padding:12, borderRadius:10, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.05)", color:"#e7e5e4", cursor:"pointer" }}>
          {copied?"✓ Link copied!":"Share result"}
        </button>
        <button onClick={onReplay} className="a redBtn" style={{ flex:1, fontSize:18, letterSpacing:"0.03em", padding:12, borderRadius:10, background:RED, color:"#fff", border:"none", cursor:"pointer" }}>
          {replayLabel}
        </button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {[...rungs].reverse().map((r)=>(
          <div key={r.rung} className="res-row" style={{ borderRadius:10, padding:16, border:"1px solid rgba(255,255,255,0.10)",
            borderLeft:!r.attempted?"1px solid rgba(255,255,255,0.10)":r.cleared?`3px solid ${RED}`:"3px solid #57534e",
            background:"rgba(255,255,255,0.02)", opacity:r.attempted?1:0.45 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: r.attempted?8:0 }}>
              <span className="c" style={{ fontWeight:700, color:"#f5f5f4", fontSize:15 }}>
                <span className="a" style={{ color:RED, marginRight:8 }}>R{r.rung}</span>{r.title}
                <span style={{ color:"#a8a29e", fontWeight:400, fontSize:13, marginLeft:6 }}>· {r.universe}</span>
              </span>
              <span className="c" style={{ textTransform:"uppercase", fontSize:12, letterSpacing:"0.15em", color:!r.attempted?"#57534e":r.cleared?RED:"#a8a29e" }}>
                {!r.attempted?"Locked":r.cleared?"Cleared":"Fell"}
              </span>
            </div>
            {r.attempted && (
              <>
              <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", alignItems:"center", gap:12 }}>
                <div>
                  <div className="c" style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em", color:"#a8a29e" }}>You</div>
                  <div className="a" style={{ fontSize:24, color:"#f5f5f4" }}>{r.me.total.toFixed(0)}</div>
                  {r.me.edges.length>0 && <div style={{ fontSize:10, color:"#6ee7b7", lineHeight:1.3 }}>+{r.me.bonus} {r.me.edges.join(", ")}</div>}
                  {r.me.duos && r.me.duos.length>0 && <div style={{ fontSize:10, color:"#fbbf24", lineHeight:1.3 }}>+{r.me.duoBonus} {r.me.duos.join(", ")}</div>}
                </div>
                <div className="a" style={{ color:"#57534e" }}>VS</div>
                <div style={{ textAlign:"right" }}>
                  <div className="c" style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em", color:"#a8a29e" }}>{r.title}</div>
                  <div className="a" style={{ fontSize:24, color:"#d6d3d1" }}>{r.them.total.toFixed(0)}</div>
                  {r.them.edges.length>0 && <div style={{ fontSize:10, color:"#fda4af", lineHeight:1.3 }}>+{r.them.bonus} {r.them.edges.join(", ")}</div>}
                </div>
              </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SHARED SPIN STAGE ───────────────────────────────────────────────────────
// Reusable spinner + role-field. Both modes render this; they differ only in
// what `renderReel` shows (1 char vs 5 options) and how a character is chosen.
// Live synergy readout on the build board. Shows duos already locked in, and —
// crucially for Spin, where only ~5% of squads stumble into a pair by luck —
// flags when the fighter currently in hand would complete one.
function SynergyStrip({ team, activeChar }) {
  const placed = ROLES.map((r) => team[r.id]).filter(Boolean);
  const active = activeDuos(placed);
  const potential = potentialDuos(activeChar, placed);
  if (active.length === 0 && potential.length === 0) return null;
  const AMBER = "#fbbf24";
  return (
    <div style={{ marginTop:14, padding:"10px 12px", borderRadius:12,
      border:`1px solid ${active.length ? "rgba(251,191,36,0.35)" : "rgba(255,255,255,0.12)"}`,
      background: active.length ? "rgba(251,191,36,0.07)" : "rgba(255,255,255,0.03)" }}>
      <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:8 }}>
        <span className="c" style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.15em", color: active.length ? AMBER : "#78716c", fontWeight:700 }}>
          Squad Synergy
        </span>
        {active.length > 0 && (
          <span className="a" style={{ fontSize:16, color:AMBER }}>+{active.length * DUO_BONUS}</span>
        )}
      </div>

      {active.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:8 }}>
          {active.map((d, i) => (
            <span key={i} className="c" style={{ fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:999,
              background:"rgba(251,191,36,0.16)", color:AMBER, border:"1px solid rgba(251,191,36,0.3)" }}>
              {byId(d.a).name} + {byId(d.b).name} · {d.label} +{d.bonus}
            </span>
          ))}
        </div>
      )}

      {potential.length > 0 && (
        <div style={{ marginTop: active.length ? 8 : 6 }}>
          {potential.map((p, i) => (
            <div key={i} className="c" style={{ fontSize:11, color:"#d6d3d1", lineHeight:1.5 }}>
              Slot <b style={{ color:"#f5f5f4" }}>{activeChar.name}</b> to pair with{" "}
              <b style={{ color:"#f5f5f4" }}>{p.partner.name}</b> — {p.label}{" "}
              <span style={{ color:AMBER, fontWeight:700 }}>+{DUO_BONUS}</span>
            </div>
          ))}
        </div>
      )}

      {active.length === 0 && potential.length === 0 && null}
    </div>
  );
}

function SpinStage({
  title, subtitle, team, activeChar, onPlace, allFilled, onClimb,
  reelArea, belowReel, filledCount, footNote, onHelp, lockedIn=false,
  accent=RED, hud=null, quickPlace=true,
}) {
  const openRoles = ROLES.filter((r) => !team[r.id]);
  return (
    <div className="tIn">
      <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr)", gap:20 }} className="spinGrid">
        <style>{`@media(min-width:820px){.spinGrid{grid-template-columns:320px minmax(0,1fr)!important}.quickPlace{display:none!important}}`}</style>

        {/* left: spinner column */}
        <div style={{ minWidth:0 }}>
          <div style={{ marginBottom:14, padding:"12px 14px 12px", borderRadius:16, border:`1px solid ${accent}44`,
            background:`linear-gradient(150deg, ${accent}22, rgba(255,255,255,0.02) 72%)` }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
              <div style={{ minWidth:0 }}>
                <div className="a" style={{ fontSize:22, lineHeight:1.1, color:"#f5f5f4", overflowWrap:"anywhere" }}>{title}</div>
                {subtitle && <div className="c" style={{ fontSize:13, color:"#a8a29e", marginTop:3 }}>{subtitle}</div>}
              </div>
              {onHelp && <HowToPlayButton onClick={onHelp} />}
            </div>
            <div style={{ display:"flex", gap:5, marginTop:12 }} role="img" aria-label={`${filledCount} of ${ROLES.length} roles filled`}>
              {ROLES.map((r) => (
                <div key={r.id} title={r.name} style={{ flex:1, height:7, borderRadius:99, transition:"background .25s",
                  background: team[r.id] ? r.color : "rgba(255,255,255,0.10)" }} />
              ))}
            </div>
            <div className="c" style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:12, color:"#78716c", letterSpacing:"0.06em", textTransform:"uppercase" }}>
              <span>{filledCount}/{ROLES.length} roles</span>
              {filledCount < ROLES.length && <span>{ROLES.length - filledCount} to go</span>}
            </div>
            {hud}
          </div>
          {reelArea}
          {belowReel}
          {quickPlace && activeChar && !allFilled && openRoles.length > 0 && (
            <div className="quickPlace" style={{ marginTop:12, padding:12, borderRadius:14, border:`1px solid ${accent}66`, background:`${accent}14` }}>
              <div className="c" style={{ fontSize:12, letterSpacing:"0.16em", textTransform:"uppercase", color:"#e7e5e4", fontWeight:700, marginBottom:8 }}>
                Place {activeChar.name} in
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {openRoles.map((r) => {
                  const f = roleFit(activeChar, r.id);
                  const fc = f.tone==="great" ? "#22c55e" : f.tone==="good" ? "#eab308" : "#ef4444";
                  return (
                    <button key={r.id} onClick={() => onPlace(r.id)} className="c hov"
                      style={{ textAlign:"left", padding:"9px 10px", borderRadius:10, cursor:"pointer", color:"#e7e5e4", minWidth:0,
                        border:`1px solid ${r.color}66`, background:"rgba(0,0,0,0.32)" }}>
                      <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ height:8, width:8, borderRadius:99, background:r.color, flexShrink:0 }} />
                        <span style={{ fontWeight:700, fontSize:15, color:"#f5f5f4", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.name}</span>
                      </span>
                      <span style={{ display:"block", fontSize:11, fontWeight:700, color:fc, textTransform:"uppercase", letterSpacing:"0.05em", marginTop:3 }}>
                        {f.label}{activeChar.role === r.id && !/signature/i.test(f.label) ? " · ★" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="c" style={{ marginTop:12, fontSize:12, color:"#78716c", textAlign:"center" }}>{footNote}</div>
        </div>

        {/* right: the seven role slots */}
        <div style={{ minWidth:0 }}>
          <SideTitle>Your Formation</SideTitle>
          <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr)", gap:10, marginTop:10 }} className="roleGrid">
            <style>{`@media(min-width:520px){.roleGrid{grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important}}`}</style>
            {ROLES.map((role, i) => {
              const member = team[role.id];
              const canPlace = activeChar && !member;
              return (
                <div key={role.id} style={{ gridColumn: (i === ROLES.length - 1 && ROLES.length % 2 === 1 ? "1 / -1" : "auto"), minWidth:0 }}>
                  <RoleSlot role={role} member={member} active={canPlace} disabled={!canPlace}
                    onClick={() => canPlace && onPlace(role.id)} />
                </div>
              );
            })}
          </div>

          <SynergyStrip team={team} activeChar={activeChar} />

          {allFilled ? (
            <button onClick={onClimb} disabled={lockedIn} className="a redBtn"
              style={{ marginTop:16, width:"100%", fontSize:20, letterSpacing:"0.03em", padding:"14px", borderRadius:12, background:lockedIn?"#166534":RED, color:"#fff", border:"none", cursor:lockedIn?"default":"pointer", boxShadow:lockedIn?"none":"0 4px 0 #a31219, 0 12px 30px -10px rgba(255,45,53,0.7)", opacity:lockedIn?0.95:1 }}>
              {lockedIn ? "LOCKED IN ✓" : "LOCK IN TEAM →"}
            </button>
          ) : activeChar ? (
            <p className="c" style={{ marginTop:12, fontSize:13, color:"#a8a29e", textAlign:"center" }}>
              Tap a highlighted role to slot <b style={{color:"#f5f5f4"}}>{activeChar.name}</b>. Match tags to the role for a bonus.
            </p>
          ) : (
            <p className="c" style={{ marginTop:12, fontSize:13, color:"#78716c", textAlign:"center" }}>
              {filledCount}/{ROLES.length} roles filled · spin to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Lightweight WebAudio feedback — no external sound files or dependencies.
let spinAudioCtx = null;
function getSpinAudioContext() {
  if (typeof window === "undefined") return null;
  try {
    spinAudioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (spinAudioCtx.state === "suspended") spinAudioCtx.resume();
    return spinAudioCtx;
  } catch { return null; }
}
function playSpinTone(freq=520, duration=0.045, type="square", gain=0.018) {
  const ctx = getSpinAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(g).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + duration + 0.01);
  } catch {}
}
function playSpinStart() {
  playSpinTone(240, 0.08, "sawtooth", 0.022);
  setTimeout(() => playSpinTone(360, 0.07, "square", 0.018), 55);
}
function playSpinTick(progress=0) {
  const freq = 420 + progress * 260;
  playSpinTone(freq, 0.035, "square", 0.012);
}
function playSpinLand() {
  playSpinTone(620, 0.07, "square", 0.026);
  setTimeout(() => playSpinTone(820, 0.11, "sine", 0.021), 55);
}
function playPlaceTone() {
  playSpinTone(700, 0.055, "triangle", 0.018);
  setTimeout(() => playSpinTone(980, 0.09, "sine", 0.016), 45);
}

// tiny slot-machine reel animation hook shared by both modes
function useReel(seedBase) {
  const [spinning, setSpinning] = useState(false);
  const [reelFace, setReelFace] = useState(null);
  const [settleKey, setSettleKey] = useState(0);
  function run(pool, onSettle) {
    if (spinning || pool.length === 0) return;
    getSpinAudioContext();
    playSpinStart();
    setSpinning(true);
    let ticks = 0;
    const totalTicks = 13;
    const iv = setInterval(() => {
      setReelFace(pool[(Math.random()*pool.length)|0]);
      playSpinTick(ticks / totalTicks);
      ticks++;
      if (ticks >= totalTicks) {
        clearInterval(iv);
        setReelFace(null); setSpinning(false);
        setSettleKey((k) => k + 1);
        playSpinLand();
        onSettle();
      }
    }, 68);
  }
  return { spinning, reelFace, settleKey, run };
}

// ─── SPIN MODE ───────────────────────────────────────────────────────────────
// Spin → 1 character → take it (place) or spin again.
function SpinMode() {
  const [seed] = useState(() => (Math.random()*1e9)|0);
  const [team, setTeam] = useState({});          // roleId -> {character, roleId}
  const [spinCount, setSpinCount] = useState(0);
  const [rerollsUsed, setRerollsUsed] = useState(0);
  const [current, setCurrent] = useState(null);
  const [phase, setPhase] = useState("play");
  const { spinning, reelFace, settleKey, run } = useReel(seed);

  const takenIds = Object.values(team).map((m) => m.character.id);
  const filledCount = Object.keys(team).length;
  const allFilled = filledCount === ROLES.length;
  const MAX_REROLLS = MAX_REROLLS_SPIN;
  const rerollsLeft = MAX_REROLLS - rerollsUsed;
  const [seenHelp, markSeenHelp] = useSeenModal("animevs_seen_help_spin");
  const [helpOpen, setHelpOpen] = useState(!seenHelp);

  function spin() {
    if (current || allFilled) return;
    const pool = CHARACTERS.filter((c) => !takenIds.includes(c.id));
    run(pool, () => {
      const chosen = drawFrom(pool, 1, seed ^ (spinCount*2654435761) ^ (Date.now() & 0xffff))[0];
      setCurrent(chosen); setSpinCount((n) => n + 1);
    });
  }
  function discardAndReroll() {
    if (!current || spinning) return;
    if (rerollsUsed >= MAX_REROLLS) return;       // hard cap on discards
    const pool = CHARACTERS.filter((c) => !takenIds.includes(c.id));
    setRerollsUsed((r) => r + 1);
    setCurrent(null);
    run(pool, () => {
      const chosen = drawFrom(pool, 1, seed ^ (spinCount*2654435761) ^ (Date.now() & 0xffff))[0];
      setCurrent(chosen); setSpinCount((n) => n + 1);
    });
  }
  function placeInto(roleId) {
    if (!current) return;
    setTeam((t) => ({ ...t, [roleId]: { character: current, roleId } }));
    playPlaceTone();
    setCurrent(null);
  }
  function reset() { setTeam({}); setCurrent(null); setSpinCount(0); setRerollsUsed(0); setPhase("play"); }

  if (phase === "done") return <ClimbResult team={ROLES.map((r)=>team[r.id])} onReplay={reset} replayLabel="NEW SPIN" />;

  const reelArea = (
    <div className={`spinReel ${spinning ? "spinReelActive" : ""}`} style={{ borderRadius:16, padding:20, border:"1px solid rgba(255,255,255,0.12)", background:"linear-gradient(160deg,rgba(255,45,53,0.10),rgba(255,255,255,0.02) 60%)", textAlign:"center", minHeight: current ? 0 : 210, display:"flex", flexDirection:"column", justifyContent:"center" }}>
      {current ? (
        <div key={settleKey} className="spinPop spinLand">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <TierBadge tier={current.tier} />
            <div className="a" style={{ fontSize:40, lineHeight:1, color:"#f5f5f4" }}>{current.rating}</div>
          </div>
          <div className="c" style={{ fontWeight:700, fontSize:22, color:"#f5f5f4", marginTop:4 }}>{current.name}</div>
          <div className="c" style={{ fontSize:12, textTransform:"uppercase", letterSpacing:"0.08em", color:"#a8a29e", marginBottom:8 }}>{current.series} · {current.cost} cr</div>
          <div style={{ display:"flex", gap:5, justifyContent:"center", flexWrap:"wrap", marginBottom:8 }}>{current.tags.map((t)=><Tag key={t} t={t} />)}</div>
          <AbilityChip ability={current.ability} />
          <SignatureHint character={current} />
          <div className="c" style={{ marginTop:10, fontSize:13, color:RED, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em" }}>Pick a role → to place</div>
        </div>
      ) : reelFace ? (
        <div className="reel reelRolling">
          <div className="a" style={{ fontSize:40, lineHeight:1, color:"#78716c" }}>{reelFace.rating}</div>
          <div className="c" style={{ fontWeight:700, fontSize:22, color:"#78716c", marginTop:4 }}>{reelFace.name}</div>
        </div>
      ) : (
        <div>
          <div className="a" style={{ fontSize:30, color:"#57534e", lineHeight:1.1 }}>READY</div>
          <div className="c" style={{ fontSize:14, color:"#a8a29e", marginTop:6 }}>Spin to summon a fighter</div>
        </div>
      )}
    </div>
  );

  const belowReel = (
    <>
      {!current && (
        <button onClick={spin} disabled={spinning || allFilled} className="a redBtn"
          style={{ marginTop:14, width:"100%", fontSize:26, letterSpacing:"0.05em", padding:"16px", borderRadius:12,
            background:(spinning||allFilled)?"#44210f":RED, color:"#fff", border:"none",
            cursor:(spinning||allFilled)?"not-allowed":"pointer",
            boxShadow:(spinning||allFilled)?"none":"0 4px 0 #a31219, 0 12px 30px -10px rgba(255,45,53,0.7)" }}>
          {allFilled ? "TEAM FULL" : spinning ? "SPINNING…" : "SPIN"}
        </button>
      )}
      {current && (
        <button onClick={discardAndReroll} disabled={rerollsUsed>=MAX_REROLLS || spinning}
          className={rerollsUsed>=MAX_REROLLS?"":"c ghostBtn"}
          style={{ marginTop:14, width:"100%", textTransform:"uppercase", letterSpacing:"0.15em", fontSize:14, fontWeight:700, padding:"14px", borderRadius:12, background:"transparent",
            border: rerollsUsed>=MAX_REROLLS?"1px solid rgba(255,255,255,0.08)":`1px solid ${RED}66`,
            color: rerollsUsed>=MAX_REROLLS?"#57534e":RED, cursor:(rerollsUsed>=MAX_REROLLS||spinning)?"not-allowed":"pointer" }}>
          {rerollsUsed>=MAX_REROLLS ? "No rerolls left — place this fighter" : `↻ Discard & reroll · ${rerollsLeft} left`}
        </button>
      )}
    </>
  );

  return (
    <>
      <SpinStage
        title="Spin Mode" subtitle="One fighter per spin — take it or risk another."
        team={team} activeChar={current} onPlace={placeInto}
        allFilled={allFilled} onClimb={() => setPhase("done")}
        reelArea={reelArea} belowReel={belowReel}
        filledCount={filledCount}
        footNote={`Rerolls left: ${rerollsLeft}/${MAX_REROLLS} · Roles filled: ${filledCount}/${ROLES.length}`}
        onHelp={() => setHelpOpen(true)}
      />
      {helpOpen && <HowToPlayModal modeId="spin" onClose={() => { setHelpOpen(false); markSeenHelp(); }} />}
    </>
  );
}

// ─── DRAFT MODE ──────────────────────────────────────────────────────────────
// Spin → 5 options under a credit budget → pick one → place. 1 reroll.
function DraftMode() {
  const [seed, setSeed] = useState(() => (Math.random()*1e9)|0);
  const [team, setTeam] = useState({});           // roleId -> {character, roleId}
  const [spinCount, setSpinCount] = useState(0);
  const [options, setOptions] = useState(null);   // array of 5 chars, or null
  const [current, setCurrent] = useState(null);   // the picked-from-options char awaiting placement
  const [rerollsUsed, setRerollsUsed] = useState(0);
  const [rerollNonce, setRerollNonce] = useState(0);
  const [phase, setPhase] = useState("play");
  const { spinning, reelFace, settleKey, run } = useReel(seed);

  const placed = Object.values(team).map((m) => m.character);
  const spent = placed.reduce((s,c)=>s+c.cost,0) + (current ? current.cost : 0);
  const remaining = BUDGET - spent;
  const takenIds = [...placed.map((c)=>c.id), ...(current?[current.id]:[])];
  const filledCount = Object.keys(team).length;
  const allFilled = filledCount === ROLES.length;
  const MAX_REROLLS = MAX_REROLLS_DRAFT;
  const [seenHelp, markSeenHelp] = useSeenModal("animevs_seen_help_draft");
  const [helpOpen, setHelpOpen] = useState(!seenHelp);

  const MIN_COST = Math.min(...CHARACTERS.map((c) => c.cost));
  function affordableCost(currentPlacedCount, spentOverride) {
    const slotsLeftAfterThis = ROLES.length - currentPlacedCount - 1;
    const reserve = slotsLeftAfterThis * MIN_COST;
    const spent = spentOverride !== undefined ? spentOverride : placed.reduce((s,x)=>s+x.cost,0);
    return (BUDGET - spent) - reserve;
  }
  // Draw 5 options but GUARANTEE at least one is affordable, so the player can
  // always make a legal pick — no softlock, no need for free rerolls.
  function drawAffordable(pool, drawSeed) {
    const cap = affordableCost(Object.keys(team).length);
    let opts = drawFrom(pool, DRAW_SIZE, drawSeed);
    if (!opts.some((c) => c.cost <= cap)) {
      // none affordable: swap the priciest option for the cheapest affordable fighter in the pool
      const affordable = pool.filter((c) => c.cost <= cap).sort((a,b)=>a.cost-b.cost);
      if (affordable.length) {
        opts = [...opts].sort((a,b)=>b.cost-a.cost);
        opts[0] = affordable[0];
      }
    }
    return opts;
  }

  function spin() {
    if (current || options || allFilled) return;
    const pool = CHARACTERS.filter((c) => !takenIds.includes(c.id));
    run(pool, () => {
      setOptions(drawAffordable(pool, seed ^ (spinCount*2654435761) ^ (rerollNonce*40503)));
      setSpinCount((n)=>n+1);
    });
  }
  function reroll() {
    if (!options || spinning) return;
    if (rerollsUsed >= MAX_REROLLS) return;      // hard cap: exactly 1 reroll, no exceptions
    const pool = CHARACTERS.filter((c) => !takenIds.includes(c.id));
    const n = rerollNonce + 1;
    setRerollsUsed((r) => r + 1);                 // functional update — no stale closure
    setRerollNonce(n);
    run(pool, () => setOptions(drawAffordable(pool, seed ^ (spinCount*2654435761) ^ (n*40503))));
  }
  function choose(c) {
    if (c.cost > affordableCost(Object.keys(team).length)) return; // reserve-aware guard
    setCurrent(c); setOptions(null);
  }
  function placeInto(roleId) {
    if (!current) return;
    setTeam((t)=>({ ...t, [roleId]: { character: current, roleId } }));
    playPlaceTone();
    setCurrent(null);
  }
  function reset() {
    // A new draft gets a fresh draw seed so replay never reproduces the same opening five.
    setSeed((Math.random()*1e9)|0);
    setTeam({}); setOptions(null); setCurrent(null); setSpinCount(0);
    setRerollsUsed(0); setRerollNonce(0); setPhase("play");
  }

  if (phase === "done") return <ClimbResult team={ROLES.map((r)=>team[r.id])} onReplay={reset} replayLabel="NEW DRAFT" />;

  const budgetLeftForPick = BUDGET - placed.reduce((s,x)=>s+x.cost,0);
  const slotsAfterThis = ROLES.length - Object.keys(team).length - 1;
  const reserveNeeded = Math.max(0, slotsAfterThis * MIN_COST);
  const maxAffordable = budgetLeftForPick - reserveNeeded;

  const reelArea = (
    <div className={`spinReel ${spinning ? "spinReelActive" : ""}`} style={{ borderRadius:16, padding:16, border:"1px solid rgba(59,130,246,0.30)", background:"linear-gradient(160deg,rgba(59,130,246,0.14),rgba(255,255,255,0.02) 60%)", minHeight: current ? 0 : 210 }}>
      {current ? (
        <div key={settleKey} className="spinPop spinLand" style={{ textAlign:"center", padding:"12px 0" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <TierBadge tier={current.tier} />
            <div className="a" style={{ fontSize:40, lineHeight:1, color:"#f5f5f4" }}>{current.rating}</div>
          </div>
          <div className="c" style={{ fontWeight:700, fontSize:22, color:"#f5f5f4", marginTop:4 }}>{current.name}</div>
          <div className="c" style={{ fontSize:12, textTransform:"uppercase", letterSpacing:"0.08em", color:"#a8a29e", marginBottom:8 }}>{current.series} · {current.cost} cr</div>
          <div style={{ display:"flex", gap:5, justifyContent:"center", flexWrap:"wrap", marginBottom:8 }}>{current.tags.map((t)=><Tag key={t} t={t} />)}</div>
          <AbilityChip ability={current.ability} />
          <SignatureHint character={current} />
          <div className="c" style={{ marginTop:12, fontSize:13, color:RED, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em" }}>Pick a role → to place</div>
        </div>
      ) : options ? (
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, padding:"8px 12px", borderRadius:8, background:"rgba(59,130,246,0.10)", border:"1px solid rgba(59,130,246,0.3)" }}>
            <span className="c" style={{ fontSize:12, textTransform:"uppercase", letterSpacing:"0.12em", color:"#a8a29e" }}>Choose one · your budget</span>
            <span className="a" style={{ fontSize:22, color:"#93c5fd", lineHeight:1 }}>{budgetLeftForPick}<span style={{ color:"#57534e", fontSize:14 }}> cr left</span></span>
          </div>
          {reserveNeeded > 0 && (
            <div className="c" style={{ fontSize:11, color:"#78716c", marginBottom:8, textAlign:"center" }}>
              Keeping {reserveNeeded} cr in reserve so you can fill your last {slotsAfterThis} role{slotsAfterThis===1?"":"s"}.
            </div>
          )}
          <div className="draftOptions" style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {options.map((c)=>{
              const tooPricey = c.cost > maxAffordable;
              const leftAfter = budgetLeftForPick - c.cost;
              return (
                <button key={c.id} onClick={()=>choose(c)} disabled={tooPricey} className={`${tooPricey?"":"hov"} draftOption`}
                  style={{ textAlign:"left", padding:"10px 12px", borderRadius:9, cursor:tooPricey?"not-allowed":"pointer", color:"#e7e5e4",
                    border:"1px solid rgba(255,255,255,0.12)", background: tooPricey?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.05)", opacity:tooPricey?0.5:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                    <div style={{ minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <TierBadge tier={c.tier} small />
                        <span className="c" style={{ fontWeight:700, fontSize:15, color:"#f5f5f4" }}>{c.name}</span>
                      </div>
                      <div className="c" style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.05em", color:"#78716c", marginTop:2 }}>{c.series}</div>
                    </div>
                    {/* prominent cost block */}
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ display:"flex", alignItems:"baseline", gap:6, justifyContent:"flex-end" }}>
                        <span className="a" style={{ fontSize:20, color:"#f5f5f4" }}>{c.rating}</span>
                        <span className="c" style={{ fontSize:10, color:"#57534e", textTransform:"uppercase" }}>pwr</span>
                      </div>
                      <div className="a" style={{ fontSize:20, lineHeight:1.1, color: tooPricey?"#ef4444":"#fbbf24", marginTop:2 }}>
                        −{c.cost}<span className="c" style={{ fontSize:11, color:"#a8a29e", fontFamily:"inherit" }}> cr</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:4, marginTop:6, marginBottom:6, flexWrap:"wrap" }}>{c.tags.map((t)=><Tag key={t} t={t} small/>)}</div>
                  <SignatureHint character={c} />
                  <AbilityChip ability={c.ability} small />
                  {/* spend preview */}
                  <div className="c" style={{ marginTop:8, fontSize:12, color: tooPricey?"#ef4444":"#78716c", borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:6, display:"flex", justifyContent:"space-between" }}>
                    {tooPricey ? (
                      <span style={{ fontWeight:700 }}>Can't afford — would leave too little for your other roles</span>
                    ) : (
                      <><span>Spend <b style={{color:"#fbbf24"}}>{c.cost} cr</b></span><span>→ leaves <b style={{color:"#93c5fd"}}>{leftAfter} cr</b> for {slotsAfterThis} more</span></>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : reelFace ? (
        <div className="reel" style={{ textAlign:"center", padding:"40px 0" }}>
          <div className="a" style={{ fontSize:40, lineHeight:1, color:"#78716c" }}>{reelFace.rating}</div>
          <div className="c" style={{ fontWeight:700, fontSize:22, color:"#78716c", marginTop:4 }}>{reelFace.name}</div>
        </div>
      ) : (
        <div style={{ textAlign:"center", padding:"50px 0" }}>
          <div className="a" style={{ fontSize:30, color:"#57534e", lineHeight:1.1 }}>READY</div>
          <div className="c" style={{ fontSize:14, color:"#a8a29e", marginTop:6 }}>Spin for five options</div>
        </div>
      )}
    </div>
  );

  const belowReel = (
    <>
      {!options && !current && (
        <button onClick={spin} disabled={spinning || allFilled} className="a redBtn"
          style={{ marginTop:14, width:"100%", fontSize:26, letterSpacing:"0.05em", padding:"16px", borderRadius:12,
            background:(spinning||allFilled)?"#44210f":RED, color:"#fff", border:"none",
            cursor:(spinning||allFilled)?"not-allowed":"pointer",
            boxShadow:(spinning||allFilled)?"none":"0 4px 0 #a31219, 0 12px 30px -10px rgba(255,45,53,0.7)" }}>
          {allFilled ? "TEAM FULL" : spinning ? "SPINNING…" : "SPIN"}
        </button>
      )}
      {options && (
        <button onClick={reroll} disabled={rerollsUsed>=MAX_REROLLS || spinning}
          className={rerollsUsed>=MAX_REROLLS?"":"ghostBtn"}
          style={{ marginTop:12, width:"100%", textTransform:"uppercase", letterSpacing:"0.1em", fontSize:14, fontWeight:700, padding:"12px", borderRadius:10, background:"transparent",
            border: rerollsUsed>=MAX_REROLLS?"1px solid rgba(255,255,255,0.08)":`1px solid ${RED}66`,
            color: rerollsUsed>=MAX_REROLLS?"#57534e":RED, cursor:(rerollsUsed>=MAX_REROLLS||spinning)?"not-allowed":"pointer" }}>
          {rerollsUsed>=MAX_REROLLS ? "Rerolls used" : `↻ Reroll these options · ${MAX_REROLLS - rerollsUsed} left`}
        </button>
      )}
      {current && (
        <div className="c" style={{ marginTop:12, fontSize:12, color:"#a8a29e", textAlign:"center" }}>
          Place this fighter into a role to continue.
        </div>
      )}
    </>
  );

  return (
    <>
      <SpinStage
        title="Draft Mode" subtitle="Spin for five, pick one, place it." accent="#3b82f6"
        hud={<div style={{ marginTop:10 }}>
          <div className="c" style={{ display:"flex", justifyContent:"space-between", fontSize:12, letterSpacing:"0.06em", textTransform:"uppercase", color:"#93c5fd", marginBottom:4 }}><span>Budget</span><span>{remaining} / {BUDGET} cr</span></div>
          <div style={{ height:7, borderRadius:99, background:"rgba(255,255,255,0.10)", overflow:"hidden" }}><div style={{ width:`${Math.max(0, Math.min(100, (remaining / BUDGET) * 100))}%`, height:"100%", background:"#3b82f6", borderRadius:99, transition:"width .3s" }} /></div>
        </div>}
        team={team} activeChar={current} onPlace={placeInto}
        allFilled={allFilled} onClimb={() => setPhase("done")}
        reelArea={reelArea} belowReel={belowReel}
        filledCount={filledCount}
        footNote={`Budget ${BUDGET - placed.reduce((s,x)=>s+x.cost,0)} left · Roles filled: ${filledCount}/${ROLES.length}`}
        onHelp={() => setHelpOpen(true)}
      />
      {helpOpen && <HowToPlayModal modeId="draft" onClose={() => { setHelpOpen(false); markSeenHelp(); }} />}
    </>
  );
}

// Everything the lazily-loaded Versus chunk needs from this file.
export {
  AUCTION_BUDGET,
  AUCTION_MIN_BID,
  AbilityChip,
  CHARACTERS,
  HowToPlayButton,
  HowToPlayModal,
  MAX_REROLLS,
  MAX_REROLLS_SPIN,
  PICKS,
  ROLES,
  SignatureHint,
  SpinStage,
  Tag,
  TierBadge,
  auctionBid,
  auctionClockMs,
  auctionExpire,
  auctionFold,
  auctionJoin,
  auctionKey,
  auctionLock,
  auctionLot,
  auctionMaxBid,
  auctionNew,
  auctionNext,
  auctionOpen,
  auctionOther,
  auctionStart,
  auctionTeamValid,
  byId,
  decodeTeam,
  drawFrom,
  encodeTeam,
  fittedRating,
  playPlaceTone,
  resolvePvP,
  roleFit,
  useReel,
  useSeenModal
};
