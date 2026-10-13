<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Category multi-select or single
            'category'    => 'nullable|string',
            'subcategory' => 'nullable|string',
            'brand'       => 'nullable|string',
            'color'       => 'nullable|string',

            // Effective price range (and legacy minPrice/maxPrice)
            'min'         => 'nullable|numeric|min:0|lte:max',
            'max'         => 'nullable|numeric|min:0|gte:min',
            'minPrice'    => 'nullable|numeric|min:0',
            'maxPrice'    => 'nullable|numeric|min:0',

            // Stock filter (stock=1 or boolean)
            'stock'       => 'nullable|in:0,1,true,false',

            // Search query (q or search)
            'q'           => 'nullable|string',
            'search'      => 'nullable|string',

            // Strict sort whitelist
            'sort'        => 'nullable|string|in:newest,price_asc,price_desc,name_asc,price-asc,price-desc,rating,discount,default',

            // Pagination (default 16, max from config)
            'page'        => 'nullable|integer|min:1',
            'per_page'    => 'nullable|integer|min:1|max:' . config('api.max_per_page', 100),
            'limit'       => 'nullable|integer|min:1|max:' . config('api.max_per_page', 100),

            // Additional attributes
            'discount'    => 'nullable|numeric|min:0|max:100',
            'rating'      => 'nullable|numeric|min:0|max:5',
            'occasion'    => 'nullable|string',
            'on_sale'     => 'nullable|boolean',
        ];
    }
}
