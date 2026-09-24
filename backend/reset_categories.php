<?php
require __DIR__ . '/vendor/autoload.php';
 = require_once __DIR__ . '/bootstrap/app.php';
->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Category;

Category::truncate();
echo 'Old categories deleted' . PHP_EOL;

 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/></svg>';
 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="19" r="2"/><circle cx="20" cy="19" r="2"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

 = [
  ['name'=>'Gifts','slug'=>'gifts','icon'=>,'parent_category'=>null,'sort_order'=>1,'is_active'=>true,'show_in_menu'=>true,'status'=>'Active'],
  ['name'=>'Diwali Gifts','slug'=>'diwali-gifts','icon'=>,'parent_category'=>'gifts','sort_order'=>1,'is_active'=>true,'show_in_menu'=>true,'status'=>'Active'],
  ['name'=>'Birthday Gifts','slug'=>'birthday-gifts','icon'=>,'parent_category'=>'gifts','sort_order'=>2,'is_active'=>true,'show_in_menu'=>true,'status'=>'Active'],
  ['name'=>'Anniversary Gifts','slug'=>'anniversary-gifts','icon'=>,'parent_category'=>'gifts','sort_order'=>3,'is_active'=>true,'show_in_menu'=>true,'status'=>'Active'],
  ['name'=>'Toys','slug'=>'toys','icon'=>,'parent_category'=>null,'sort_order'=>2,'is_active'=>true,'show_in_menu'=>true,'status'=>'Active'],
  ['name'=>'Soft Toys','slug'=>'soft-toys','icon'=>,'parent_category'=>'toys','sort_order'=>1,'is_active'=>true,'show_in_menu'=>true,'status'=>'Active'],
  ['name'=>'Baby Toys','slug'=>'baby-toys','icon'=>,'parent_category'=>'toys','sort_order'=>2,'is_active'=>true,'show_in_menu'=>true,'status'=>'Active'],
  ['name'=>'Board Games','slug'=>'board-games','icon'=>,'parent_category'=>'toys','sort_order'=>3,'is_active'=>true,'show_in_menu'=>true,'status'=>'Active'],
  ['name'=>'Astrology','slug'=>'astrology','icon'=>,'parent_category'=>null,'sort_order'=>3,'is_active'=>true,'show_in_menu'=>true,'status'=>'Active'],
  ['name'=>'Rings','slug'=>'rings','icon'=>,'parent_category'=>'astrology','sort_order'=>1,'is_active'=>true,'show_in_menu'=>true,'status'=>'Active'],
  ['name'=>'Pendants','slug'=>'pendants','icon'=>,'parent_category'=>'astrology','sort_order'=>2,'is_active'=>true,'show_in_menu'=>true,'status'=>'Active'],
  ['name'=>'Bracelets','slug'=>'bracelets','icon'=>,'parent_category'=>'astrology','sort_order'=>3,'is_active'=>true,'show_in_menu'=>true,'status'=>'Active'],
  ['name'=>'Gemstones & Crystals','slug'=>'gemstones-crystals','icon'=>,'parent_category'=>'astrology','sort_order'=>4,'is_active'=>true,'show_in_menu'=>true,'status'=>'Active'],
];

foreach ( as ) {
    Category::create();
     = ['parent_category'] ? '   + ' . ['name'] : '[MAIN] ' . ['name'];
    echo  . PHP_EOL;
}

echo PHP_EOL . 'DONE! ' . count() . ' categories created.' . PHP_EOL;
