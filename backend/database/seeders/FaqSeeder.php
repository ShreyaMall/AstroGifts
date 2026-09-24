<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Faq;

class FaqSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faqs = [
            [
                'question' => "Will you have special product releases?",
                'answer' => "Yes, we frequently release limited edition pieces and seasonal collections. Sign up for our newsletter to get early access and notifications about new product drops.",
                'sort_order' => 1
            ],
            [
                'question' => "Do you offer public relations?",
                'answer' => "Yes, we work with various media outlets, interior designers, and influencers. Please contact our PR team for collaboration inquiries.",
                'sort_order' => 2
            ],
            [
                'question' => "Are your items easily assembled?",
                'answer' => "Most of our items come fully assembled. For larger pieces like beds or certain dining tables, minor assembly is required. We provide clear, step-by-step instructions and all necessary hardware.",
                'sort_order' => 3
            ],
            [
                'question' => "Is same-day delivery available for any items?",
                'answer' => "Same-day delivery is currently only available for select pin codes in major metropolitan areas for orders placed before 12 PM. Standard delivery takes 3-5 business days.",
                'sort_order' => 4
            ],
            [
                'question' => "Do I need to be there for my large item delivery?",
                'answer' => "Yes, for large furniture items, someone over the age of 18 must be present to receive and sign for the delivery. Our delivery team will schedule a time window with you in advance.",
                'sort_order' => 5
            ]
        ];

        foreach ($faqs as $faq) {
            Faq::create($faq);
        }
    }
}
