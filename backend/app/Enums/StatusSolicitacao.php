<?php

namespace App\Enums;

enum StatusSolicitacao: string
{
    case RECEBIDA   = 'RECEBIDA';
    case EM_ANALISE = 'EM_ANALISE';
    case AGENDADA   = 'AGENDADA';
    case CONCLUIDA  = 'CONCLUIDA';
    case CANCELADA  = 'CANCELADA';

    
    public function proximosPermitidos(): array
    {
        return match($this) {
            self::RECEBIDA   => [self::EM_ANALISE, self::CANCELADA],
            self::EM_ANALISE => [self::AGENDADA, self::CANCELADA],
            self::AGENDADA   => [self::CONCLUIDA, self::CANCELADA],
            self::CONCLUIDA  => [],
            self::CANCELADA  => [],
        };
    }

    
    public function podeTransicionarPara(self $novo): bool
    {
        return in_array($novo, $this->proximosPermitidos(), strict: true);
    }

    
    public function isFinal(): bool
    {
        return match($this) {
            self::CONCLUIDA, self::CANCELADA => true,
            default => false,
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}