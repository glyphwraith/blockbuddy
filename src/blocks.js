// Bedrock texture names (file names in textures/blocks and textures/items).
// Anything missing? Use "Add custom ID" in the app.
const wrap = s => s.trim().split(/\s+/);
const BLOCKS = wrap(`stone stone_granite stone_granite_smooth stone_diorite stone_diorite_smooth stone_andesite stone_andesite_smooth
dirt cobblestone cobblestone_mossy sand gravel clay bedrock sandstone_top stonebrick brick
planks_oak planks_spruce planks_birch planks_jungle planks_acacia planks_big_oak
log_oak log_spruce log_birch log_jungle log_acacia log_big_oak leaves_oak
coal_ore iron_ore gold_ore diamond_ore emerald_ore lapis_ore redstone_ore copper_ore
coal_block iron_block gold_block diamond_block emerald_block lapis_block redstone_block copper_block netherite_block
glass glass_white bookshelf obsidian crying_obsidian netherrack soul_sand glowstone sea_lantern shroomlight
end_stone quartz_block_side tnt_side crafting_table_front furnace_front_off
wool_colored_white wool_colored_orange wool_colored_pink wool_colored_light_blue wool_colored_red wool_colored_black
concrete_white concrete_red concrete_blue ice ice_packed snow slime magma sponge pumpkin_side melon_side hay_block_side
ancient_debris_side cobweb mob_spawner torch_on fire_0`);
const ITEMS = wrap(`totem wood_sword stone_sword iron_sword gold_sword diamond_sword netherite_sword
wood_pickaxe iron_pickaxe diamond_pickaxe netherite_pickaxe diamond_axe diamond_shovel diamond_hoe bow_standby
apple apple_golden bread beef_cooked diamond emerald gold_ingot iron_ingot netherite_ingot nether_star
ender_pearl ender_eye experience_bottle book_normal book_enchanted name_tag`);
const ENV = [
  { id: 'sun', path: 'textures/environment/sun.png' },
  { id: 'moon_phases', path: 'textures/environment/moon_phases.png' },
  { id: 'clouds', path: 'textures/environment/clouds.png' },
  { id: 'enchanted_item_glint', path: 'textures/misc/enchanted_item_glint.png' },
  { id: 'enchanted_actor_glint', path: 'textures/misc/enchanted_actor_glint.png' },
  { id: 'pumpkinblur (overlay)', path: 'textures/misc/pumpkinblur.png' }
];
