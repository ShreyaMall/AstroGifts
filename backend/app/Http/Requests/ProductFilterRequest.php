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
            'category' => 'nullable|string',
            'subcategory' => 'nullable|string',
            'brand' => 'nullable|string',
            'color' => 'nullable|string',
            'minPrice' => 'nullable|numeric|min:0',
            'maxPrice' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0|max:100',
            'rating' => 'nullable|numeric|min:0|max:5',
            'occasion' => 'nullable|string',
            'sort' => 'nullable|string|in:rating,price-asc,price-desc,newest,discount,default',
            'page' => 'nullable|integer|min:1',
            'limit' => 'nullable|integer|min:1|max:50',
            'search' => 'nullable|string',
            'on_sale' => 'nullable|boolean',
        ];
    }
}
