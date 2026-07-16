<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Reward;

class RewardSeeder extends Seeder
{
    public function run(): void
    {
        $rewards = [
            ['studio' => "TOGE PRODUCTIONS", 'item_name' => "Coffee Talk Baileys Collector's Pin", 'price' => 1500, 'img' => "coffee-talk_pin_baileys-collectors-front-TEMP_web.webp", 'tag' => "New", 'old_price' => null],
            ['studio' => "TOGE PRODUCTIONS", 'item_name' => "Coffee Talk Lua Collector's Pin", 'price' => 2500, 'img' => "coffee-talk_pin_lua-collectors_web.webp", 'tag' => "New", 'old_price' => null],
            ['studio' => "TOGE PRODUCTIONS", 'item_name' => "Coffee Talk Aqua Collector's Pin", 'price' => 2500, 'img' => "coffee-talk_pin_aqua-collectors_web.webp", 'tag' => "New", 'old_price' => null],
            ['studio' => "TOGE PRODUCTIONS", 'item_name' => "Coffee Talk Neil Collector's Pin", 'price' => 2500, 'img' => "sanshee_coffee-talk_Neil-collector_s-pin.webp", 'tag' => "New", 'old_price' => null],
            ['studio' => "TOGE PRODUCTIONS", 'item_name' => "Coffee Talk Hyde Collector's Pin", 'price' => 2500, 'img' => "sanshee_coffee-talk_Hyde-collector_s-pin.webp", 'tag' => "New", 'old_price' => null],
            ['studio' => "TOGE PRODUCTIONS", 'item_name' => "Coffee Talk Hyde & Neil Standee", 'price' => 5000, 'old_price' => 6500, 'img' => "product-image_Coffee-Talk_Hyde-Neil-Standee_WBG.webp", 'tag' => "Save 1.500 PTS"],
            ['studio' => "MOJIKEN STUDIO", 'item_name' => "Mojiken Studio Exclusive E-Voucher", 'price' => 1500, 'img' => "Game Gift Card MojiKeN.png", 'tag' => "Digital", 'old_price' => null],
            ['studio' => "Digital Happiness", 'item_name' => "DreadOut Official Linda Bag", 'price' => 12000, 'img' => "Linda_DO_bag.webp", 'tag' => "Merch", 'old_price' => null],
            ['studio' => "Gooseworx", 'item_name' => "Glitch Productions Pomni UwU", 'price' => 200000, 'img' => "Pomni-Default.webp", 'tag' => "Merch", 'old_price' => null],
        ];

        foreach ($rewards as $reward) {
            Reward::create($reward);
        }
    }
}
