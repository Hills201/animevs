import React, { useState, useMemo } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { supabase, supabaseConfigured } from "./supabaseClient.js";

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
// 2+ matches = perfect (+18%), 1 match = decent (+8%), 0 = misfit (-15%).
// PLUS: if placed in the character's canonical/signature role, an extra +8%.
function sameSignatureRole(character, roleId) {
  if (!character?.role) return false;
  if (character.role === roleId) return true;
  // Support and Support II are one signature-role family.
  return (character.role === "support" && roleId === "support2") || (character.role === "support2" && roleId === "support");
}
function roleFit(character, roleId) {
  const role = roleById(roleId);
  if (!character || !role) return { mult: 1, label: "—", tone: "none", matches: 0, signature: false };
  const matches = character.tags.filter((t) => role.wants.includes(t)).length;
  const signature = sameSignatureRole(character, roleId);
  let base;
  if (matches >= 2) base = { mult: 1.18, label: "Perfect fit", tone: "great", matches };
  else if (matches === 1) base = { mult: 1.08, label: "Good fit", tone: "good", matches };
  else base = { mult: 0.85, label: "Misfit", tone: "bad", matches };
  if (signature) {
    // Signature placement is never punished by a tag-mismatch penalty.
    // It still gets the +8% signature bonus on top of the neutral floor.
    const sigBase = Math.max(1, base.mult);
    return { ...base, mult: sigBase + 0.08, label: matches >= 2 ? "Perfect fit · Signature" : matches === 1 ? "Good fit · Signature" : "Signature role", tone: matches >= 2 ? "great" : "good", signature: true };
  }
  return { ...base, signature: false };
}
function fittedRating(character, roleId) {
  return Math.round(character.rating * roleFit(character, roleId).mult);
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
const COUNTERS = [
  { win:"range", lose:"melee", label:"Range > Melee" },
  { win:"mobility", lose:"range", label:"Mobility > Range" },
  { win:"melee", lose:"mobility", label:"Melee > Mobility" },
  { win:"barrier", lose:"element", label:"Barrier > Element" },
  { win:"giant", lose:"melee", label:"Giant > Melee" },
  { win:"aura", lose:"barrier", label:"Aura > Barrier" },
  { win:"speed", lose:"giant", label:"Speed > Giant" },
  { win:"energy", lose:"barrier", label:"Energy > Barrier" },
  { win:"stealth", lose:"summon", label:"Stealth > Summon" },
  { win:"psychic", lose:"speed", label:"Psychic > Speed" },
  { win:"regen", lose:"element", label:"Regen > Element" },
  { win:"transform", lose:"stealth", label:"Transform > Stealth" },
  { win:"heal", lose:"regen", label:"Heal > Regen" },
];
const COUNTER_BONUS = 15;
const tagCount = (team, tag) => team.reduce((n, c) => n + (c.tags.includes(tag) ? 1 : 0), 0);

// ─── ABILITIES ──────────────────────────────────────────────────────────────
// Effect types and how each reads. Effects hook into rating/counter/role math.
const ABILITY_INFO = {
  role_synergy:   (a) => `+${a.x} rating as ${roleById(a.role)?.name || a.role}`,
  counter_immune: ()  => `Blocks the first enemy counter`,
  tag_projection: (a) => `Counts as ${a.tag} for counters`,
  rival_bonus:    (a) => `+${a.x} team vs ${a.universe}`,
  adaptable:      ()  => `Never takes the Misfit penalty`,
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
  // adaptable: floor the misfit penalty to neutral
  if (ab && ab.type === "adaptable" && fit.mult < 1) fit = { ...fit, mult: 1, label: "Adaptable", tone: "good" };
  let r = character.rating * fit.mult;
  if (!ab) return Math.round(r);
  const ax = ab.x || 0; // guard: a missing bonus value must never poison the total
  // role_synergy
  if (ab.type === "role_synergy" && ab.role === roleId) r += ax;
  // clutch: only on hard rungs
  if (ab.type === "clutch" && ctx && ctx.rungNumber >= 6) r += ax;
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
      if (ab.type === "clutch" && rungNumber >= 6) abilityNotes.push(`${ab.name}`);
      if (ab.type === "overwhelm" && isHighest) abilityNotes.push(`${ab.name}`);
      if (ab.type === "adaptable" && roleFit(m.character, m.roleId).mult < 1) abilityNotes.push(`${ab.name}`);
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

  // counters — tag_projection adds virtual tags; counter_immune blocks first enemy edge
  const projected = clean.flatMap((m) => {
    const ab = m.character.ability;
    return (ab && ab.type === "tag_projection") ? [ab.tag] : [];
  });
  const countWith = (tag) => tagCount(chars, tag) + projected.filter((t) => t === tag).length;

  const edges = [];
  let bonus = 0;
  for (const ctr of COUNTERS) {
    if (countWith(ctr.win) > 0 && countWith(ctr.win) > tagCount(oppChars, ctr.lose)) {
      bonus += COUNTER_BONUS; edges.push(ctr.label);
    }
  }
  const hasImmunity = clean.some((m) => m.character.ability && m.character.ability.type === "counter_immune");
  return { total: base + bonus, base, bonus, edges, abilityNotes: [...new Set(abilityNotes)], hasImmunity };
}

// Opponent squads are auto-assigned to roles by best fit (so they get fair role bonuses too)
function autoAssign(chars) {
  const roleIds = ROLES.map((r) => r.id);
  return chars.map((c, i) => {
    let best = roleIds[i % roleIds.length], bestFit = -1;
    for (const rid of roleIds) {
      const f = roleFit(c, rid).mult;
      if (f > bestFit) { bestFit = f; best = rid; }
    }
    return { character: c, roleId: best };
  });
}

function resolveRung(myTeam, rung) {
  const oppChars = rung.team.map(byId);
  const oppTeam = autoAssign(oppChars);
  const meCtx = { rungNumber: rung.rung, universe: rung.universe };
  const themCtx = { rungNumber: rung.rung, universe: null };
  let me = squadScore(myTeam, oppChars, 1, meCtx);
  let them = squadScore(oppTeam, myTeam.map((m) => m.character), rung.boost, themCtx);
  // counter_immune: if you have it, cancel the enemy's single largest counter edge
  if (me.hasImmunity && them.edges.length > 0) {
    them = { ...them, total: them.total - COUNTER_BONUS, bonus: them.bonus - COUNTER_BONUS,
             edges: them.edges.slice(1), immunityUsed: true };
  }
  // and vice versa (enemy immunity vs your counters)
  if (them.hasImmunity && me.edges.length > 0) {
    me = { ...me, total: me.total - COUNTER_BONUS, bonus: me.bonus - COUNTER_BONUS, edges: me.edges.slice(1) };
  }
  return { me, them, cleared: me.total >= them.total };
}

// ─── PVP: team vs team, no boost. Higher total wins. ────────────────────────
function resolvePvP(teamA, teamB) {
  const charsA = teamA.map((m) => m.character);
  const charsB = teamB.map((m) => m.character);
  let a = squadScore(teamA, charsB, 1, { rungNumber: 5, universe: null });
  let b = squadScore(teamB, charsA, 1, { rungNumber: 5, universe: null });
  // mutual counter immunity
  if (a.hasImmunity && b.edges.length > 0) b = { ...b, total: b.total - COUNTER_BONUS, bonus: b.bonus - COUNTER_BONUS, edges: b.edges.slice(1) };
  if (b.hasImmunity && a.edges.length > 0) a = { ...a, total: a.total - COUNTER_BONUS, bonus: a.bonus - COUNTER_BONUS, edges: a.edges.slice(1) };
  const winner = a.total === b.total ? "tie" : a.total > b.total ? "a" : "b";
  return { a, b, winner };
}

// ─── TEAM CODEC (order-independent, checksummed) ────────────────────────────
const CODEC_ROLES = ROLES.map((r) => r.id); // dynamic: all roles in order
const SLOT_COUNT = CODEC_ROLES.length;
const SORTED_IDS = CHARACTERS.map((c) => c.id).sort();
function _b64url(bytes){ let bin=String.fromCharCode(...bytes); let s=btoa(bin); return s.replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
function _unb64url(str){ str=str.replace(/-/g,"+").replace(/_/g,"/"); while(str.length%4)str+="="; const bin=atob(str); return [...bin].map((c)=>c.charCodeAt(0)); }
function _checksum(str){ let h=0; for(const ch of str) h=(h*31+ch.charCodeAt(0))%36; return h.toString(36).toUpperCase(); }

function encodeTeam(team){ // team: [{character, roleId}] — 11 bits/slot (8 char + 3 role)
  const ordered = CODEC_ROLES.map((rid) => team.find((t) => t.roleId === rid));
  if (ordered.some((m) => !m)) return null;
  let bits = [];
  for (const m of ordered){
    const ci = SORTED_IDS.indexOf(m.character.id), ri = CODEC_ROLES.indexOf(m.roleId);
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
      const id=SORTED_IDS[ci]; const character=byId(id);
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
    const ci = SORTED_IDS.indexOf(m.character.id), ri = CODEC_ROLES.indexOf(m.roleId);
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
      const id=SORTED_IDS[ci]; const character=byId(id);
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
  // If the page was opened via a challenge link (?vs=CODE) or a shared result
  // (?result=CODE), start straight in the right place.
  const [mode, setMode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("vs")) return "pvp";
      if (params.get("result")) return "result";
      if (params.get("roomtest")) return "roomtest"; // TEMP: Supabase realtime proof-of-concept
    } catch (e) {}
    return null;
  }); // null | "draft" | "spin" | "pvp" | "result" | "roomtest"
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  return (
    <div style={{ minHeight:"100vh", background:INK, color:"#e7e5e4", fontFamily:"'Barlow', system-ui, sans-serif" }}>
      <Fonts />
      <div style={{ position:"relative", maxWidth:1024, margin:"0 auto", padding:"28px 20px 120px" }}>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(circle at 50% 0%, rgba(255,45,53,0.10), transparent 45%)" }} />
        <div style={{ position:"relative" }}>
          <Header mode={mode} onHome={() => { try { window.history.replaceState({}, "", window.location.pathname); } catch (e) {} setMode(null); }} onFeedback={() => setFeedbackOpen(true)} onGuide={() => setGuideOpen(true)} />
          {mode === null && <Home setMode={setMode} />}
          {mode === "draft" && <DraftMode />}
          {mode === "spin" && <SpinMode />}
          {mode === "pvp" && <PvpMode />}
          {mode === "result" && <SharedResultView setMode={setMode} />}
          {mode === "roomtest" && <RoomTestView />}
        </div>
      </div>
      <AdBanner />
      {feedbackOpen && <FeedbackModal currentMode={mode} onClose={() => setFeedbackOpen(false)} />}
      {guideOpen && <SystemGuideModal onClose={() => setGuideOpen(false)} />}
      <Analytics />
      <SpeedInsights />
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
  pvp: {
    title: "VERSUS",
    accent: "#a855f7",
    steps: [
      { h:"Build your team", b:"Spin to fill your 7 roles, same as Spin mode — your opponent can't see your picks." },
      { h:"Get a challenge link", b:"Lock in and you'll get a shareable link. Send it to a friend to challenge them." },
      { h:"They build blind", b:"Opening your link drops them straight into building their own team, hidden from yours." },
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
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:100, background:"rgba(0,0,0,0.7)",
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
    { id:"tiers",    label:"Tier Caps" },
  ];

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:100, background:"rgba(0,0,0,0.75)",
      display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(2px)", padding:16 }}>
      <div onClick={(e)=>e.stopPropagation()} className="slam"
        style={{ width:"100%", maxWidth:600, maxHeight:"88vh", overflowY:"auto", background:"#141519",
          borderRadius:18, border:"1px solid rgba(255,255,255,0.12)", padding:"20px 20px 26px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
          <div className="a" style={{ fontSize:26, color:"#f5f5f4" }}>HOW SCORING WORKS</div>
          <button onClick={onClose} className="c" style={{ background:"transparent", border:"none", color:"#78716c", fontSize:22, cursor:"pointer", padding:4, lineHeight:1 }}>✕</button>
        </div>
        <p className="c" style={{ fontSize:13, color:"#a8a29e", marginTop:6, marginBottom:16, lineHeight:1.5 }}>
          Every fighter's final score in a battle comes from four layers stacked together. Flip through each tab below.
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
          Every role "wants" a few tags. When you place a fighter into a role, the game checks how many of their tags match:
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:12 }}>
          <FitRow tone="great" label="2+ matching tags" val="Perfect fit" mult="+18%" />
          <FitRow tone="good" label="1 matching tag" val="Good fit" mult="+8%" />
          <FitRow tone="bad" label="0 matching tags" val="Misfit" mult="−15%" />
        </div>
        <p className="c" style={{ fontSize:12, color:"#78716c", lineHeight:1.5 }}>
          These percentages multiply the fighter's base rating up or down — so the same character can score very differently depending on which role you put them in.
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
function FitRow({ tone, label, val, mult }) {
  const color = tone==="great" ? "#4ade80" : tone==="good" ? "#93c5fd" : "#f87171";
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", borderRadius:8, background:"rgba(255,255,255,0.03)", border:`1px solid ${color}33` }}>
      <span className="c" style={{ fontSize:13, color:"#a8a29e" }}>{label}</span>
      <span className="c" style={{ fontSize:13, fontWeight:700, color }}>{val} · {mult}</span>
    </div>
  );
}

function GuideSignature() {
  return (
    <div>
      <GuideSection title="Signature role bonus">
        <p className="c" style={{ fontSize:13, color:"#d6d3d1", lineHeight:1.6, marginBottom:10 }}>
          Every fighter has one canonical role — the one they're known for in their series. Placing them there grants an extra <b style={{color:"#4ade80"}}>+8%</b> on top of their tag-fit bonus.
        </p>
        <p className="c" style={{ fontSize:13, color:"#d6d3d1", lineHeight:1.6, marginBottom:10 }}>
          This stacks with role fit — so a fighter in their signature role with 2+ matching tags gets <b>Perfect fit + Signature</b>, roughly a +26% swing over their base rating.
        </p>
        <p className="c" style={{ fontSize:13, color:"#d6d3d1", lineHeight:1.6 }}>
          Even a misfit placement gets bumped up to neutral if it's their signature role — the game won't let lore-accurate placement be actively punished.
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
          Beyond role fit, your whole <b>team</b> can earn bonus points by out-countering the opponent's tags. If your team fields more of a "winning" tag than the opponent fields of the tag it beats, you earn <b style={{color:"#4ade80"}}>+{"15"} points</b> per edge.
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
          A fighter's tier limits how many combat tags they can carry — higher tiers are more versatile and can trigger more counter edges at once.
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
          An SS-tier fighter carrying 9 tags can plug into far more counter matchups than a C-tier fighter capped at 4 — part of what makes top-tier fighters worth their higher draft cost.
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
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:100, background:"rgba(0,0,0,0.7)",
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
// Non-intrusive sticky banner pinned to the bottom. Never covers gameplay
// (the page reserves bottom padding for it). Uses Google AdSense.
//
// SETUP: replace the two placeholders below with your real AdSense IDs:
//   1. AD_CLIENT — your publisher ID, looks like "ca-pub-1234567890123456"
//   2. AD_SLOT   — an ad-unit slot ID you create in the AdSense dashboard
// Until both are set, a subtle placeholder bar shows instead (no broken ad).
const AD_CLIENT = "ca-pub-1027225143628108"; // <-- your AdSense publisher ID
const AD_SLOT = "XXXXXXXXXX";                // <-- your AdSense ad-unit slot ID

function AdBanner() {
  const configured = !AD_CLIENT.includes("X") && !AD_SLOT.includes("X");

  React.useEffect(() => {
    if (!configured) return;
    // load the AdSense library once
    if (!document.querySelector('script[data-animevs-ads]')) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`;
      s.crossOrigin = "anonymous";
      s.setAttribute("data-animevs-ads", "1");
      document.head.appendChild(s);
    }
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }, [configured]);

  return (
    <div style={{ position:"fixed", left:0, right:0, bottom:0, zIndex:50,
      display:"flex", justifyContent:"center", alignItems:"center",
      minHeight:60, background:"rgba(11,12,16,0.92)", backdropFilter:"blur(6px)",
      borderTop:"1px solid rgba(255,255,255,0.08)" }}>
      {configured ? (
        <ins className="adsbygoogle"
          style={{ display:"block", width:"100%", height:60 }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={AD_SLOT}
          data-ad-format="horizontal"
          data-full-width-responsive="false" />
      ) : (
        <span className="c" style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:"#57534e" }}>
          advertisement
        </span>
      )}
    </div>
  );
}

function Fonts() {
  return <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800&display=swap');
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
    .spinPop{animation:spinPop .4s cubic-bezier(.2,.9,.3,1) both}
    .reel{animation:reelFlash .12s linear infinite}
    .clash{animation:clashPulse .7s ease-in-out infinite}
    .vsShake{animation:vsShake .5s ease-in-out infinite}
    .verdictPop{animation:verdictPop .5s cubic-bezier(.2,.8,.2,1) both}
    .sweepBar{background:linear-gradient(90deg,rgba(255,45,53,.15) 25%,rgba(255,45,53,.5) 50%,rgba(255,45,53,.15) 75%);background-size:200% 100%;animation:sweep 1.1s linear infinite}
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
function Home({ setMode }) {
  const cards = [
    { id:"spin", title:"SPIN", tagline:"Spin the reel. Take it or risk another. Slot fighters into seven roles.", accent:RED },
    { id:"draft", title:"DRAFT", tagline:"Five draws, one budget. Build the sharpest squad you can afford.", accent:"#3b82f6" },
    { id:"pvp", title:"VERSUS", tagline:"Build a team, share a code. Challenge a friend head-to-head.", accent:"#a855f7" },
  ];
  return (
    <div className="tIn">
      <p className="c" style={{ fontSize:15, letterSpacing:"0.1em", color:"#a8a29e", textTransform:"uppercase", marginBottom:20 }}>
        Choose your mode
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:16 }} className="homeGrid">
        <style>{`@media(min-width:720px){.homeGrid{grid-template-columns:1fr 1fr!important}}`}</style>
        {cards.map((c) => (
          <button key={c.id} onClick={() => setMode(c.id)} className="hov"
            style={{ textAlign:"left", padding:28, borderRadius:16, cursor:"pointer", color:"#e7e5e4",
              border:"1px solid rgba(255,255,255,0.12)",
              background:`linear-gradient(160deg, ${c.accent}22, rgba(255,255,255,0.02) 55%)` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div className="a" style={{ fontSize:34, color:"#f5f5f4", lineHeight:1 }}>{c.title}</div>
            </div>
            <p className="c" style={{ fontSize:16, color:"#a8a29e", margin:0, lineHeight:1.4 }}>{c.tagline}</p>
            <div className="c" style={{ marginTop:16, fontSize:13, letterSpacing:"0.2em", textTransform:"uppercase", color:c.accent, fontWeight:700 }}>
              Play →
            </div>
          </button>
        ))}
      </div>
      <div style={{ marginTop:24, padding:16, borderRadius:12, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.02)" }}>
        <div className="c" style={{ fontSize:13, textTransform:"uppercase", letterSpacing:"0.2em", color:RED, fontWeight:700, marginBottom:8 }}>The seven roles</div>
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
        boxShadow: active ? `0 0 0 3px ${role.color}22` : "none" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom: member?8:0 }}>
        <span style={{ height:10, width:10, borderRadius:99, background:role.color }} />
        <span className="c" style={{ fontWeight:700, fontSize:15, color:"#f5f5f4" }}>{role.name}</span>
        <span className="c" style={{ fontSize:12, color:"#a8a29e" }}>· {role.blurb}</span>
      </div>
      {member ? (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ display:"flex", alignItems:"center", gap:6 }}>
              <TierBadge tier={member.character.tier} small />
              <span className="c" style={{ fontWeight:700, fontSize:16, color:"#f5f5f4" }}>{member.character.name}</span>
            </span>
            <span className="a" style={{ fontSize:22, color:fitColor }}>{fittedRating(member.character, role.id)}</span>
          </div>
          <div style={{ marginTop:2, marginBottom:4 }}>
            <div className="c" style={{ fontSize:11, fontWeight:700, color:fitColor, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>{fit.label}</div>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{member.character.tags.map((t)=><Tag key={t} t={t} small />)}</div>
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
      <div className="a" style={{ fontSize:34, color:"#f5f5f4", lineHeight:1, marginBottom:2 }}>{cur.title}</div>
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
              {cur.cleared ? "CLEARED" : "DEFEATED"}
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
// ─── ROOM TEST (TEMPORARY) ───────────────────────────────────────────────────
// Proof-of-concept for live PvP rooms via Supabase Realtime. Not linked from
// the home screen — reachable at ?roomtest=1 while we build this out.
// Once the real feature is built, this whole block gets removed.
function genRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function RoomTestView() {
  const [roomCode, setRoomCode] = useState("");
  const [joinInput, setJoinInput] = useState("");
  const [role, setRole] = useState(null); // "a" | "b" | null
  const [roomState, setRoomState] = useState(null); // live row from Supabase
  const [status, setStatus] = useState("idle"); // idle | creating | joining | connected | error
  const [errorMsg, setErrorMsg] = useState("");

  if (!supabaseConfigured) {
    return (
      <div className="tIn" style={{ maxWidth: 480, margin: "60px auto", textAlign: "center" }}>
        <div className="a" style={{ fontSize: 24, color: "#f5f5f4", marginBottom: 8 }}>ROOM TEST</div>
        <p className="c" style={{ color: "#a8a29e" }}>
          Supabase isn't configured — missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
        </p>
      </div>
    );
  }

  async function createRoom() {
    setStatus("creating");
    setErrorMsg("");
    const code = genRoomCode();
    const { error } = await supabase.from("rooms").insert({ code });
    if (error) { setStatus("error"); setErrorMsg(error.message); return; }
    setRoomCode(code);
    setRole("a");
    subscribeToRoom(code);
  }

  async function joinRoom() {
    const code = joinInput.trim().toUpperCase();
    if (!code) return;
    setStatus("joining");
    setErrorMsg("");
    const { data, error } = await supabase.from("rooms").select("*").eq("code", code).single();
    if (error || !data) { setStatus("error"); setErrorMsg("Room not found — check the code."); return; }
    setRoomCode(code);
    setRole("b");
    subscribeToRoom(code);
  }

  function subscribeToRoom(code) {
    setStatus("connected");
    supabase
      .channel(`room:${code}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `code=eq.${code}` },
        (payload) => setRoomState(payload.new))
      .subscribe();
  }

  // Once we know our role, mark ourselves ready in the row (simple presence test)
  React.useEffect(() => {
    if (!roomCode || !role) return;
    const field = role === "a" ? "player_a_ready" : "player_b_ready";
    supabase.from("rooms").update({ [field]: true }).eq("code", roomCode).then(({ error }) => {
      if (error) setErrorMsg(error.message);
    });
    // fetch initial state too, in case the row changed before our subscription attached
    supabase.from("rooms").select("*").eq("code", roomCode).single().then(({ data }) => {
      if (data) setRoomState(data);
    });
  }, [roomCode, role]);

  const bothReady = roomState?.player_a_ready && roomState?.player_b_ready;

  return (
    <div className="tIn" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="a" style={{ fontSize: 28, color: "#f5f5f4", marginBottom: 4 }}>ROOM TEST</div>
      <p className="c" style={{ color: "#a8a29e", fontSize: 13, marginBottom: 24 }}>
        Proof of concept — proving live presence works before building real PvP rooms on top of it.
      </p>

      {!roomCode ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <button onClick={createRoom} disabled={status === "creating"} className="a redBtn"
            style={{ padding: "16px", borderRadius: 12, background: RED, color: "#fff", border: "none", cursor: "pointer", fontSize: 18 }}>
            {status === "creating" ? "Creating…" : "Create Room"}
          </button>
          <div className="c" style={{ textAlign: "center", color: "#57534e", fontSize: 12 }}>— or —</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={joinInput} onChange={(e) => setJoinInput(e.target.value)} placeholder="Enter room code"
              className="c" style={{ flex: 1, padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.14)", color: "#f5f5f4", fontSize: 16, outline: "none", textTransform: "uppercase" }} />
            <button onClick={joinRoom} disabled={status === "joining"} className="c"
              style={{ padding: "12px 20px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "#e7e5e4", cursor: "pointer", fontWeight: 700 }}>
              Join
            </button>
          </div>
        </div>
      ) : (
        <div style={{ borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)" }}>
          <div className="c" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.15em", color: "#78716c", marginBottom: 6 }}>Room code</div>
          <div className="a" style={{ fontSize: 36, color: "#f5f5f4", marginBottom: 16, letterSpacing: "0.1em" }}>{roomCode}</div>
          <div className="c" style={{ fontSize: 13, color: "#a8a29e", marginBottom: 16 }}>You are Player {role === "a" ? "A (host)" : "B (joined)"}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <PresenceDot label="Player A" ready={!!roomState?.player_a_ready} />
            <PresenceDot label="Player B" ready={!!roomState?.player_b_ready} />
          </div>
          {bothReady && (
            <div className="c" style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", fontWeight: 700, textAlign: "center" }}>
              ✓ Both players connected — realtime works!
            </div>
          )}
        </div>
      )}

      {errorMsg && <div className="c" style={{ color: "#ef4444", fontSize: 13, marginTop: 12 }}>{errorMsg}</div>}
    </div>
  );
}
function PresenceDot({ label, ready }) {
  return (
    <div style={{ flex: 1, textAlign: "center", padding: 12, borderRadius: 10, background: ready ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${ready ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"}` }}>
      <div style={{ fontSize: 20 }}>{ready ? "🟢" : "⚪"}</div>
      <div className="c" style={{ fontSize: 12, color: ready ? "#4ade80" : "#78716c", marginTop: 4 }}>{label}{ready ? " ready" : " waiting…"}</div>
    </div>
  );
}

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
  const [copied, setCopied] = useState(false);

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
    <div style={{ maxWidth:640, margin:"0 auto" }}>
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
            {rungs.map(r=><div key={r.rung} style={{ height:8, flex:1, borderRadius:999, background:!r.attempted?"rgba(255,255,255,0.09)":r.cleared?RED:"#44403c" }} />)}
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
      <div style={{ display:"flex", gap:12, marginBottom:24 }}>
        <button onClick={shareLink} className="c darkBtn" style={{ flex:1, textTransform:"uppercase", letterSpacing:"0.15em", fontSize:14, fontWeight:700, padding:12, borderRadius:10, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.05)", color:"#e7e5e4", cursor:"pointer" }}>
          {copied?"✓ Link copied!":"Share result"}
        </button>
        <button onClick={onReplay} className="a redBtn" style={{ flex:1, fontSize:18, letterSpacing:"0.03em", padding:12, borderRadius:10, background:RED, color:"#fff", border:"none", cursor:"pointer" }}>
          {replayLabel}
        </button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {[...rungs].reverse().map((r)=>(
          <div key={r.rung} style={{ borderRadius:10, padding:16, border:"1px solid rgba(255,255,255,0.10)",
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
                </div>
                <div className="a" style={{ color:"#57534e" }}>VS</div>
                <div style={{ textAlign:"right" }}>
                  <div className="c" style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em", color:"#a8a29e" }}>{r.title}</div>
                  <div className="a" style={{ fontSize:24, color:"#d6d3d1" }}>{r.them.total.toFixed(0)}</div>
                  {r.them.edges.length>0 && <div style={{ fontSize:10, color:"#fda4af", lineHeight:1.3 }}>+{r.them.bonus} {r.them.edges.join(", ")}</div>}
                </div>
              </div>
              <div style={{ marginTop:10, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <div style={{ borderRadius:8, padding:9, background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)" }}>
                  {team.map((m) => {
                    const shown = displayedRating(m, { rungNumber:r.rung, isHighest:m.character.rating === Math.max(...team.map((x)=>x.character.rating)) });
                    const base = fittedRating(m.character, m.roleId);
                    const delta = shown - base;
                    return <div key={m.roleId} className="c" style={{ fontSize:10, color:delta>0?"#d8b4fe":"#78716c", display:"flex", justifyContent:"space-between", gap:8 }}>
                      <span>{m.character.name}</span><b>{shown}{delta>0?` (+${delta})`:""}</b>
                    </div>;
                  })}
                </div>
                <div className="c" style={{ fontSize:10, color:"#78716c", padding:9, lineHeight:1.35 }}>
                  Fighter ratings include role fit and rung-specific abilities. Bonuses such as <b style={{color:"#d8b4fe"}}>+X on rungs 6–10</b> are shown here as the purple delta.
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
function SpinStage({
  title, subtitle, team, activeChar, onPlace, allFilled, onClimb,
  reelArea, belowReel, filledCount, footNote, onHelp,
}) {
  return (
    <div className="tIn">
      <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:20 }} className="spinGrid">
        <style>{`@media(min-width:820px){.spinGrid{grid-template-columns:320px 1fr!important}}`}</style>

        {/* left: spinner column */}
        <div>
          <div style={{ marginBottom:12, display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
            <div>
              <div className="c" style={{ color:RED, letterSpacing:"0.25em", fontSize:12, textTransform:"uppercase" }}>{title}</div>
              {subtitle && <div className="c" style={{ fontSize:13, color:"#a8a29e", marginTop:2 }}>{subtitle}</div>}
            </div>
            {onHelp && <HowToPlayButton onClick={onHelp} />}
          </div>
          {reelArea}
          {belowReel}
          <div className="c" style={{ marginTop:12, fontSize:12, color:"#78716c", textAlign:"center" }}>{footNote}</div>
        </div>

        {/* right: the seven role slots */}
        <div>
          <SideTitle>Your Formation</SideTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:10, marginTop:10 }} className="roleGrid">
            <style>{`@media(min-width:520px){.roleGrid{grid-template-columns:1fr 1fr!important}}`}</style>
            {ROLES.map((role, i) => {
              const member = team[role.id];
              const canPlace = activeChar && !member;
              return (
                <div key={role.id} style={{ gridColumn: (i === ROLES.length - 1 && ROLES.length % 2 === 1 ? "1 / -1" : "auto") }}>
                  <RoleSlot role={role} member={member} active={canPlace} disabled={!canPlace}
                    onClick={() => canPlace && onPlace(role.id)} />
                </div>
              );
            })}
          </div>

          {allFilled ? (
            <button onClick={onClimb} className="a redBtn"
              style={{ marginTop:16, width:"100%", fontSize:20, letterSpacing:"0.03em", padding:"14px", borderRadius:10, background:RED, color:"#fff", border:"none", cursor:"pointer", boxShadow:"0 8px 30px -8px rgba(255,45,53,0.7)" }}>
              ENTER THE LADDER →
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

// tiny slot-machine reel animation hook shared by both modes
function useReel(seedBase) {
  const [spinning, setSpinning] = useState(false);
  const [reelFace, setReelFace] = useState(null);
  function run(pool, onSettle) {
    if (spinning || pool.length === 0) return;
    setSpinning(true);
    let ticks = 0;
    const iv = setInterval(() => {
      setReelFace(pool[(Math.random()*pool.length)|0]);
      ticks++;
      if (ticks > 12) {
        clearInterval(iv);
        setReelFace(null); setSpinning(false);
        onSettle();
      }
    }, 60);
  }
  return { spinning, reelFace, run };
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
  const { spinning, reelFace, run } = useReel(seed);

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
    setCurrent(null);
  }
  function reset() { setTeam({}); setCurrent(null); setSpinCount(0); setRerollsUsed(0); setPhase("play"); }

  if (phase === "done") return <ClimbResult team={ROLES.map((r)=>team[r.id])} onReplay={reset} replayLabel="NEW SPIN" />;

  const reelArea = (
    <div style={{ borderRadius:16, padding:20, border:"1px solid rgba(255,255,255,0.12)", background:"linear-gradient(160deg,rgba(255,45,53,0.10),rgba(255,255,255,0.02) 60%)", textAlign:"center", minHeight:210, display:"flex", flexDirection:"column", justifyContent:"center" }}>
      {current ? (
        <div className="spinPop">
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
        <div className="reel">
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
            boxShadow:(spinning||allFilled)?"none":"0 8px 30px -8px rgba(255,45,53,0.7)" }}>
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
  const { spinning, reelFace, run } = useReel(seed);

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
    <div style={{ borderRadius:16, padding:16, border:"1px solid rgba(255,255,255,0.12)", background:"linear-gradient(160deg,rgba(59,130,246,0.10),rgba(255,255,255,0.02) 60%)", minHeight:210 }}>
      {current ? (
        <div className="spinPop" style={{ textAlign:"center", padding:"12px 0" }}>
          <div className="a" style={{ fontSize:40, lineHeight:1, color:"#f5f5f4" }}>{current.rating}</div>
          <div className="c" style={{ fontWeight:700, fontSize:22, color:"#f5f5f4", marginTop:4 }}>{current.name}</div>
          <div className="c" style={{ fontSize:12, textTransform:"uppercase", letterSpacing:"0.08em", color:"#a8a29e", marginBottom:8 }}>{current.series} · {current.cost} cr</div>
          <div style={{ display:"flex", gap:5, justifyContent:"center", flexWrap:"wrap" }}>{current.tags.map((t)=><Tag key={t} t={t} />)}</div>
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
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {options.map((c)=>{
              const tooPricey = c.cost > maxAffordable;
              const leftAfter = budgetLeftForPick - c.cost;
              return (
                <button key={c.id} onClick={()=>choose(c)} disabled={tooPricey} className={tooPricey?"":"hov"}
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
            boxShadow:(spinning||allFilled)?"none":"0 8px 30px -8px rgba(255,45,53,0.7)" }}>
          {allFilled ? "TEAM FULL" : spinning ? "SPINNING…" : "SPIN"}
        </button>
      )}
      {options && (
        <button onClick={reroll} disabled={rerollsUsed>=MAX_REROLLS || spinning}
          className={rerollsUsed>=MAX_REROLLS?"":"ghostBtn"}
          style={{ marginTop:12, width:"100%", textTransform:"uppercase", letterSpacing:"0.2em", fontSize:14, fontWeight:700, padding:"12px", borderRadius:10, background:"transparent",
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
        title="Draft Mode" subtitle={`Spin for five · ${remaining} credits left`}
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

// ─── PVP MODE ────────────────────────────────────────────────────────────────
// Flow: choose to Host (build first, get code) or Challenge (paste code, build blind),
// then both teams reveal and higher total wins. Uses spin-to-build for the team.
function PvpMode() {
  const [stage, setStage] = useState("menu"); // menu | build | reveal
  const [oppCode, setOppCode] = useState("");
  const [oppTeam, setOppTeam] = useState(null); // decoded opponent (challenge mode) or null (host)
  const [oppError, setOppError] = useState("");
  const [myTeam, setMyTeam] = useState({});     // roleId -> {character, roleId}
  const [myCode, setMyCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [pasteResult, setPasteResult] = useState("");
  const [fromLink, setFromLink] = useState(false); // did opponent arrive via a challenge link?

  const [seed] = useState(() => (Math.random()*1e9)|0);
  const [current, setCurrent] = useState(null);
  const [spinCount, setSpinCount] = useState(0);
  const [rerollsUsed, setRerollsUsed] = useState(0);
  const { spinning, reelFace, run } = useReel(seed);

  // On mount: if the URL carries a challenge (?vs=CODE), auto-load the opponent
  // and drop the player straight into building their team.
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const vs = params.get("vs");
      if (vs) {
        const res = decodeTeam(vs.trim());
        if (!res.error) {
          setOppTeam(res.team); setOppCode(vs.trim()); setFromLink(true); setStage("build");
        } else {
          setOppError(res.error);
        }
      }
    } catch (e) {}
  }, []);

  const takenIds = Object.values(myTeam).map((m) => m.character.id);
  const filledCount = Object.keys(myTeam).length;
  const allFilled = filledCount === ROLES.length;
  const MAX_REROLLS = MAX_REROLLS_SPIN;
  const rerollsLeft = MAX_REROLLS - rerollsUsed;
  const [seenHelp, markSeenHelp] = useSeenModal("animevs_seen_help_pvp");
  const [helpOpen, setHelpOpen] = useState(!seenHelp);

  // Build a full shareable challenge URL from a team code.
  function challengeLink(code) {
    try {
      const base = window.location.origin + window.location.pathname;
      return `${base}?vs=${code}`;
    } catch (e) { return code; }
  }

  function spin() {
    if (current || allFilled) return;
    const pool = CHARACTERS.filter((c) => !takenIds.includes(c.id));
    run(pool, () => {
      const chosen = drawFrom(pool, 1, seed ^ (spinCount*2654435761) ^ (Date.now()&0xffff))[0];
      setCurrent(chosen); setSpinCount((n)=>n+1);
    });
  }
  function discardAndReroll() {
    if (!current || spinning) return;
    if (rerollsUsed >= MAX_REROLLS) return;
    const pool = CHARACTERS.filter((c) => !takenIds.includes(c.id));
    setRerollsUsed((r) => r + 1);
    setCurrent(null);
    run(pool, () => {
      const chosen = drawFrom(pool, 1, seed ^ (spinCount*2654435761) ^ (Date.now()&0xffff))[0];
      setCurrent(chosen); setSpinCount((n)=>n+1);
    });
  }
  function placeInto(roleId){ if(!current) return; setMyTeam((t)=>({ ...t, [roleId]:{ character:current, roleId } })); setCurrent(null); }

  function lockIn() {
    const teamArr = ROLES.map((r) => myTeam[r.id]);
    const code = encodeTeam(teamArr);
    setMyCode(code || "");
    setStage("reveal");
  }

  function tryDecodeOpponent() {
    // accept either a raw code OR a pasted challenge link
    let val = oppCode.trim();
    const m = val.match(/[?&]vs=([^&\s]+)/);
    if (m) val = decodeURIComponent(m[1]);
    const res = decodeTeam(val);
    if (res.error) { setOppError(res.error); setOppTeam(null); return false; }
    setOppError(""); setOppTeam(res.team); return true;
  }

  function reset() {
    setStage("menu"); setOppCode(""); setOppTeam(null); setOppError(""); setFromLink(false);
    setMyTeam({}); setMyCode(""); setCurrent(null); setSpinCount(0); setRerollsUsed(0); setPasteResult("");
    try { window.history.replaceState({}, "", window.location.pathname); } catch (e) {}
  }

  // ── MENU: choose host or challenge ──
  if (stage === "menu") {
    return (
      <div className="tIn" style={{ maxWidth:560, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, marginBottom:6 }}>
          <div className="a" style={{ fontSize:28, color:"#f5f5f4" }}>VERSUS</div>
          <HowToPlayButton onClick={() => setHelpOpen(true)} />
        </div>
        <p className="c" style={{ fontSize:15, color:"#a8a29e", marginBottom:24 }}>
          Two teams, no luck of the ladder — highest total wins. Build hidden, then reveal.
        </p>
        {helpOpen && <HowToPlayModal modeId="pvp" onClose={() => { setHelpOpen(false); markSeenHelp(); }} />}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <button onClick={() => setStage("build")} className="hov"
            style={{ textAlign:"left", padding:22, borderRadius:14, cursor:"pointer", color:"#e7e5e4",
              border:"1px solid rgba(255,255,255,0.12)", background:"linear-gradient(160deg,rgba(168,85,247,0.16),rgba(255,255,255,0.02) 60%)" }}>
            <div className="a" style={{ fontSize:22, color:"#f5f5f4" }}>CREATE A CHALLENGE</div>
            <p className="c" style={{ fontSize:14, color:"#a8a29e", margin:"6px 0 0" }}>Build your team, get a code, send it to a friend. They play against you.</p>
          </button>
          <button onClick={() => { setStage("build"); }} className="hov"
            style={{ textAlign:"left", padding:22, borderRadius:14, cursor:"pointer", color:"#e7e5e4",
              border:"1px solid rgba(255,255,255,0.12)", background:"linear-gradient(160deg,rgba(59,130,246,0.14),rgba(255,255,255,0.02) 60%)" }}>
            <div className="a" style={{ fontSize:22, color:"#f5f5f4" }}>ACCEPT A CHALLENGE</div>
            <p className="c" style={{ fontSize:14, color:"#a8a29e", margin:"6px 0 0" }}>Have a friend's code? Paste it on the next screen, build blind, then reveal.</p>
          </button>
        </div>
        <div style={{ marginTop:20, padding:14, borderRadius:10, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.02)" }}>
          <div className="c" style={{ fontSize:13, color:"#78716c" }}>
            Both paths build a team the same way. If you have a code, paste it below to see who wins the moment you lock in. No code? Lock in and you'll get one to share.
          </div>
        </div>

        {/* optional opponent code paste, available from menu */}
        <div style={{ marginTop:16 }}>
          <div className="c" style={{ fontSize:12, textTransform:"uppercase", letterSpacing:"0.15em", color:"#a855f7", fontWeight:700, marginBottom:8 }}>Opponent code (optional)</div>
          <div style={{ display:"flex", gap:8 }}>
            <input value={oppCode} onChange={(e)=>{ setOppCode(e.target.value); setOppError(""); }}
              placeholder="Paste a friend's team code…" className="c"
              style={{ flex:1, padding:"10px 12px", borderRadius:8, background:"rgba(255,255,255,0.05)", border:`1px solid ${oppError?"#ef4444":"rgba(255,255,255,0.14)"}`, color:"#f5f5f4", fontSize:14, outline:"none" }} />
          </div>
          {oppError && <div className="c" style={{ fontSize:12, color:"#ef4444", marginTop:6 }}>{oppError}</div>}
          {oppTeam && !oppError && <div className="c" style={{ fontSize:12, color:"#22c55e", marginTop:6 }}>✓ Opponent locked — build your team and reveal.</div>}
        </div>
      </div>
    );
  }

  // ── BUILD: spin to fill 5 roles (opponent hidden) ──
  if (stage === "build") {
    const reelArea = (
      <div style={{ borderRadius:16, padding:20, border:"1px solid rgba(255,255,255,0.12)", background:"linear-gradient(160deg,rgba(168,85,247,0.12),rgba(255,255,255,0.02) 60%)", textAlign:"center", minHeight:210, display:"flex", flexDirection:"column", justifyContent:"center" }}>
        {current ? (
          <div className="spinPop">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <TierBadge tier={current.tier} />
              <div className="a" style={{ fontSize:40, lineHeight:1, color:"#f5f5f4" }}>{current.rating}</div>
            </div>
            <div className="c" style={{ fontWeight:700, fontSize:22, color:"#f5f5f4", marginTop:4 }}>{current.name}</div>
            <div className="c" style={{ fontSize:12, textTransform:"uppercase", letterSpacing:"0.08em", color:"#a8a29e", marginBottom:8 }}>{current.series}</div>
            <div style={{ display:"flex", gap:5, justifyContent:"center", flexWrap:"wrap", marginBottom:8 }}>{current.tags.map((t)=><Tag key={t} t={t} />)}</div>
            <AbilityChip ability={current.ability} />
            <div className="c" style={{ marginTop:10, fontSize:13, color:"#a855f7", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em" }}>Pick a role → to place</div>
          </div>
        ) : reelFace ? (
          <div className="reel">
            <div className="a" style={{ fontSize:40, lineHeight:1, color:"#78716c" }}>{reelFace.rating}</div>
            <div className="c" style={{ fontWeight:700, fontSize:22, color:"#78716c", marginTop:4 }}>{reelFace.name}</div>
          </div>
        ) : (
          <div><div className="a" style={{ fontSize:30, color:"#57534e" }}>READY</div>
            <div className="c" style={{ fontSize:14, color:"#a8a29e", marginTop:6 }}>Spin to summon a fighter</div></div>
        )}
      </div>
    );
    const belowReel = (
      <>
        {!current && (
          <button onClick={spin} disabled={spinning||allFilled} className="a"
            style={{ marginTop:14, width:"100%", fontSize:26, letterSpacing:"0.05em", padding:"16px", borderRadius:12,
              background:(spinning||allFilled)?"#3a1a5c":"#a855f7", color:"#fff", border:"none",
              cursor:(spinning||allFilled)?"not-allowed":"pointer" }}>
            {allFilled?"TEAM FULL":spinning?"SPINNING…":"SPIN"}
          </button>
        )}
        {current && (
          <button onClick={discardAndReroll} disabled={rerollsUsed>=MAX_REROLLS || spinning} className="c"
            style={{ marginTop:14, width:"100%", textTransform:"uppercase", letterSpacing:"0.15em", fontSize:14, fontWeight:700, padding:"14px", borderRadius:12, background:"transparent",
              border: rerollsUsed>=MAX_REROLLS?"1px solid rgba(255,255,255,0.08)":"1px solid #a855f766",
              color: rerollsUsed>=MAX_REROLLS?"#57534e":"#c084fc", cursor:(rerollsUsed>=MAX_REROLLS||spinning)?"not-allowed":"pointer" }}>
            {rerollsUsed>=MAX_REROLLS ? "No rerolls left — place this fighter" : `↻ Discard & reroll · ${rerollsLeft} left`}
          </button>
        )}
        {oppTeam && <div className="c" style={{ marginTop:12, fontSize:12, color:"#22c55e", textAlign:"center" }}>Opponent loaded — reveal when your team is full.</div>}
      </>
    );
    return (
      <div className="tIn">
        <SpinStage
          title="Versus — build hidden" subtitle="Your opponent can't see your picks."
          team={myTeam} activeChar={current} onPlace={placeInto}
          allFilled={allFilled} onClimb={lockIn}
          reelArea={reelArea} belowReel={belowReel}
          filledCount={filledCount}
          footNote={`Rerolls left: ${rerollsLeft}/${MAX_REROLLS} · Roles filled: ${filledCount}/${ROLES.length}`}
          onHelp={() => setHelpOpen(true)}
        />
        {helpOpen && <HowToPlayModal modeId="pvp" onClose={() => { setHelpOpen(false); markSeenHelp(); }} />}
      </div>
    );
  }

  // ── REVEAL: show my code; if opponent present, resolve ──
  const myTeamArr = ROLES.map((r) => myTeam[r.id]);
  const result = oppTeam ? resolvePvP(myTeamArr, oppTeam) : null;
  const iWon = result && result.winner === "a";
  const tie = result && result.winner === "tie";

  function copyMyCode(){ navigator.clipboard?.writeText(myCode).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),1800); }); }
  function copyMyLink(){ navigator.clipboard?.writeText(challengeLink(myCode)).then(()=>{ setLinkCopied(true); setTimeout(()=>setLinkCopied(false),1800); }); }

  return (
    <div className="tIn" style={{ maxWidth:680, margin:"0 auto" }}>
      {/* My code to share */}
      <div style={{ borderRadius:14, padding:20, marginBottom:18, border:"1px solid rgba(168,85,247,0.4)", background:"rgba(168,85,247,0.08)" }}>
        <div className="c" style={{ fontSize:12, textTransform:"uppercase", letterSpacing:"0.2em", color:"#c084fc", fontWeight:700, marginBottom:8 }}>Challenge link — send it to a friend</div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ flex:1, padding:"12px 14px", borderRadius:8, background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.14)", color:"#c4b5fd", fontSize:13, fontFamily:"monospace", overflowX:"auto", whiteSpace:"nowrap" }}>{challengeLink(myCode)}</div>
          <button onClick={copyMyLink} className="a" style={{ padding:"12px 18px", borderRadius:8, background:"#a855f7", color:"#fff", border:"none", cursor:"pointer", fontSize:15, flexShrink:0 }}>
            {linkCopied?"✓ COPIED":"COPY LINK"}
          </button>
        </div>
        <div className="c" style={{ fontSize:12, color:"#a8a29e", marginTop:8 }}>
          When they open it, they'll build their team and the match resolves instantly — no codes to paste.
        </div>
        {/* raw code fallback */}
        <details style={{ marginTop:12 }}>
          <summary className="c" style={{ fontSize:12, color:"#78716c", cursor:"pointer", letterSpacing:"0.05em" }}>Prefer a plain code instead?</summary>
          <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:8 }}>
            <code style={{ flex:1, padding:"10px 12px", borderRadius:8, background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.14)", color:"#f5f5f4", fontSize:16, letterSpacing:"0.1em", fontFamily:"monospace", overflowX:"auto" }}>{myCode}</code>
            <button onClick={copyMyCode} className="c" style={{ padding:"10px 16px", borderRadius:8, background:"rgba(255,255,255,0.08)", color:"#e7e5e4", border:"1px solid rgba(255,255,255,0.14)", cursor:"pointer", fontSize:14, flexShrink:0 }}>
              {copied?"✓":"COPY"}
            </button>
          </div>
        </details>
      </div>

      {/* If no opponent yet, offer to paste one */}
      {!oppTeam && (
        <div style={{ borderRadius:14, padding:20, marginBottom:18, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.02)" }}>
          <div className="c" style={{ fontSize:13, color:"#a8a29e", marginBottom:10 }}>
            Waiting on your opponent. Paste their code or challenge link here to see who wins — or send yours and let them run the match.
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input value={oppCode} onChange={(e)=>{ setOppCode(e.target.value); setOppError(""); }}
              placeholder="Paste opponent's code or link…" className="c"
              style={{ flex:1, padding:"10px 12px", borderRadius:8, background:"rgba(255,255,255,0.05)", border:`1px solid ${oppError?"#ef4444":"rgba(255,255,255,0.14)"}`, color:"#f5f5f4", fontSize:14, outline:"none" }} />
            <button onClick={tryDecodeOpponent} className="c" style={{ padding:"10px 18px", borderRadius:8, background:"#a855f7", color:"#fff", border:"none", cursor:"pointer", fontWeight:700, fontSize:14 }}>REVEAL</button>
          </div>
          {oppError && <div className="c" style={{ fontSize:12, color:"#ef4444", marginTop:6 }}>{oppError}</div>}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="slam" style={{ borderRadius:16, overflow:"hidden", marginBottom:18, border:tie?"1px solid rgba(255,255,255,0.2)":`1px solid ${iWon?"#22c55e":"#ef4444"}` }}>
          <div style={{ textAlign:"center", padding:"24px 20px", background: tie?"rgba(255,255,255,0.03)":iWon?"linear-gradient(160deg,#0f3d2e,#0b0c10 60%)":"linear-gradient(160deg,#3d0f14,#0b0c10 60%)" }}>
            <div className="a" style={{ fontSize:48, lineHeight:1, color: tie?"#e7e5e4":iWon?"#4ade80":"#f87171" }}>
              {tie?"DEAD HEAT":iWon?"VICTORY":"DEFEAT"}
            </div>
            <div className="c" style={{ fontSize:16, color:"#a8a29e", marginTop:8 }}>
              You {result.a.total.toFixed(0)} · {result.b.total.toFixed(0)} Opponent
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }}>
            <TeamColumn label="YOUR TEAM" team={myTeamArr} score={result.a} side="a" win={iWon} />
            <TeamColumn label="OPPONENT" team={oppTeam} score={result.b} side="b" win={result.winner==="b"} />
          </div>
        </div>
      )}

      <div style={{ display:"flex", gap:12 }}>
        <button onClick={reset} className="c" style={{ flex:1, textTransform:"uppercase", letterSpacing:"0.15em", fontSize:14, fontWeight:700, padding:12, borderRadius:10, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.05)", color:"#e7e5e4", cursor:"pointer" }}>
          New match
        </button>
      </div>
    </div>
  );
}

function TeamColumn({ label, team, score, side, win }) {
  return (
    <div style={{ padding:16, background: win?"rgba(34,197,94,0.05)":"transparent", borderLeft: side==="b"?"1px solid rgba(255,255,255,0.08)":"none" }}>
      <div className="c" style={{ fontSize:11, textTransform:"uppercase", letterSpacing:"0.2em", color: win?"#4ade80":"#a8a29e", fontWeight:700, marginBottom:10 }}>{label}</div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {ROLES.map((role) => {
          const m = team.find((x) => x.roleId === role.id);
          if (!m) return null;
          const fr = fittedRating(m.character, role.id);
          return (
            <div key={role.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
              <div style={{ minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ height:7, width:7, borderRadius:99, background:role.color, flexShrink:0 }} />
                  <span className="c" style={{ fontWeight:700, fontSize:13, color:"#f5f5f4", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.character.name}</span>
                </div>
                <div className="c" style={{ fontSize:10, color:"#78716c", marginLeft:12 }}>{role.name}</div>
              </div>
              <span className="a" style={{ fontSize:16, color:"#e7e5e4", flexShrink:0 }}>{fr}</span>
            </div>
          );
        })}
      </div>
      {score.edges.length > 0 && (
        <div className="c" style={{ fontSize:10, color:"#6ee7b7", marginTop:8, lineHeight:1.3 }}>+{score.bonus} {score.edges.join(", ")}</div>
      )}
    </div>
  );
}
