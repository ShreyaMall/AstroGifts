<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index()
    {
        $faqs = Faq::where('is_active', true)->orderBy('sort_order', 'asc')->get();
        return response()->json($faqs);
    }

    public function store(Request $request)
    {
        $request->validate([
            'question' => 'required|string',
            'answer' => 'required|string',
        ]);
        $faq = Faq::create($request->all());
        return response()->json($faq, 201);
    }

    public function update(Request $request, $id)
    {
        $faq = Faq::findOrFail($id);
        $faq->update($request->all());
        return response()->json($faq);
    }

    public function destroy($id)
    {
        $faq = Faq::findOrFail($id);
        $faq->delete();
        return response()->json(['message' => 'FAQ deleted']);
    }
}
