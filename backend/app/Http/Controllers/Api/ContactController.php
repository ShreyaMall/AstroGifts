<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string',
        ]);

        $message = ContactMessage::create($request->all());

        return response()->json(['message' => 'Your message has been sent successfully.', 'data' => $message], 201);
    }

    public function index()
    {
        $messages = ContactMessage::orderBy('created_at', 'desc')->get();
        return response()->json($messages);
    }
}
