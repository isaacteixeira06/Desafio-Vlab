<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\StatusSolicitacao;
use App\Exceptions\TransicaoStatusInvalidaException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Solicitacao\AtualizarStatusRequest;
use App\Http\Requests\Solicitacao\CriarSolicitacaoRequest;
use App\Http\Resources\SolicitacaoResource;
use App\Services\SolicitacaoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SolicitacaoController extends Controller
{
    public function __construct(
        private readonly SolicitacaoService $service
    ) {}

    /**
     * GET /api/v1/solicitacoes
     * Lista paginada com filtros por status, categoria e prioridade.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $solicitacoes = $this->service->listar($request->only([
            'status',
            'categoria',
            'prioridade',
            'per_page',
        ]));

        return SolicitacaoResource::collection($solicitacoes);
    }

    /**
     * POST /api/v1/solicitacoes
     * Cria uma nova solicitação.
     */
    public function store(CriarSolicitacaoRequest $request): JsonResponse
    {
        $solicitacao = $this->service->criar($request->validated());

        return (new SolicitacaoResource($solicitacao))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/v1/solicitacoes/{id}
     * Retorna os detalhes de uma solicitação.
     */
    public function show(int $id): SolicitacaoResource
    {
        $solicitacao = $this->service->buscarPorId($id);

        return new SolicitacaoResource($solicitacao);
    }

    /**
     * PATCH /api/v1/solicitacoes/{id}/status
     * Atualiza o status respeitando o fluxo de transições.
     */
    public function atualizarStatus(AtualizarStatusRequest $request, int $id): JsonResponse
    {
        $solicitacao = $this->service->buscarPorId($id);
        $novoStatus  = StatusSolicitacao::from($request->validated('status'));

        try {
            $atualizada = $this->service->atualizarStatus($solicitacao, $novoStatus);
        } catch (TransicaoStatusInvalidaException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors'  => ['status' => [$e->getMessage()]],
            ], 422);
        }

        return (new SolicitacaoResource($atualizada))->response();
    }
}