<?php

namespace App\Enums;

enum PrioridadeSolicitacao: string
{
    case BAIXA   = 'BAIXA';
    case MEDIA   = 'MEDIA';
    case ALTA    = 'ALTA';
    case URGENTE = 'URGENTE';

    public function isUrgente(): bool
    {
        return $this === self::URGENTE;
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}