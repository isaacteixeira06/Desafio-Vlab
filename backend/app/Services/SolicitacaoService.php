<?php

namespace App\Services;

use App\Enums\StatusSolicitacao;
use App\Exceptions\TransicaoStatusInvalidaException;
use App\Models\Solicitacao;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class SolicitacaoService
{
    private const PER_PAGE = 15;

    /**
     * Lista solicitações com filtros e paginação.
     */
    public function listar(array $filtros): LengthAwarePaginator
    {
        $query = Solicitacao::query()->orderBy('created_at', 'desc');

        if (!empty($filtros['status'])) {
            $query->deStatus($filtros['status']);
        }

        if (!empty($filtros['categoria'])) {
            $query->deCategoria($filtros['categoria']);
        }

        if (!empty($filtros['prioridade'])) {
            $query->dePrioridade($filtros['prioridade']);
        }

        $perPage = isset($filtros['per_page'])
            ? min((int) $filtros['per_page'], 100)
            : self::PER_PAGE;

        return $query->paginate($perPage);
    }

    /**
     * Cria uma nova solicitação com protocolo único e status inicial RECEBIDA.
     */
    public function criar(array $dados): Solicitacao
    {
        return Solicitacao::create([
            ...$dados,
            'protocolo' => $this->gerarProtocolo(),
            'status'    => StatusSolicitacao::RECEBIDA->value,
        ]);
    }

    /**
     * Busca uma solicitação pelo ID.
     */
    public function buscarPorId(int $id): Solicitacao
    {
        return Solicitacao::findOrFail($id);
    }

    /**
     * Atualiza o status de uma solicitação, respeitando o fluxo de transições.
     *
     * @throws TransicaoStatusInvalidaException
     */
    public function atualizarStatus(Solicitacao $solicitacao, StatusSolicitacao $novoStatus): Solicitacao
    {
        $statusAtual = $solicitacao->status;

        if (!$statusAtual->podeTransicionarPara($novoStatus)) {
            throw new TransicaoStatusInvalidaException($statusAtual, $novoStatus);
        }

        $solicitacao->status = $novoStatus;
        $solicitacao->save(); // updated_at é atualizado automaticamente pelo Eloquent

        return $solicitacao->fresh();
    }

    private function gerarProtocolo(): string
    {
        do {
            $protocolo = 'SOL-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5));
        } while (Solicitacao::where('protocolo', $protocolo)->exists());

        return $protocolo;
    }
}