<?php

use App\Http\Controllers\Api\V1\SolicitacaoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - V1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // Health check
    Route::get('/health', function () {
        return response()->json([
            'status'   => 'ok',
            'database' => DB::connection()->getPdo() ? 'connected' : 'disconnected',
            'timestamp'=> now()->toIso8601String(),
        ]);
    });

    // Solicitações de Atendimento
    Route::prefix('solicitacoes')->group(function () {
        Route::get('/',          [SolicitacaoController::class, 'index']);
        Route::post('/',         [SolicitacaoController::class, 'store']);
        Route::get('/{id}',      [SolicitacaoController::class, 'show']);
        Route::patch('/{id}/status', [SolicitacaoController::class, 'atualizarStatus']);
    });

});