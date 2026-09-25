<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'demo@vlab.dev'],
            [
                'name'     => 'Usuário Demo',
                'password' => Hash::make('senha1234'),
            ]
        );
    }
}