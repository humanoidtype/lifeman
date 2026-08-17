<?php

namespace App\Http\Requests;

use App\Models\Business;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreBusinessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Business::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'rekap_period' => ['required', 'in:'.implode(',', [Business::PERIOD_WEEKLY, Business::PERIOD_MONTHLY, Business::PERIOD_YEARLY])],
            'period_start' => ['required', 'date'],
            'formula_type' => ['required', 'in:'.implode(',', [Business::FORMULA_FB_A, Business::FORMULA_FB_B, Business::FORMULA_CUSTOM])],
            'raw_material_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'operational_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'marketing_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'profit_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama bisnis wajib diisi.',
            'rekap_period.in' => 'Rekap data harus Minggu, Bulan, atau Tahun.',
            'period_start.required' => 'Periode mulai wajib diisi.',
            'formula_type.in' => 'Rumus bisnis tidak valid.',
        ];
    }

    protected function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($this->string('formula_type')->toString() !== Business::FORMULA_CUSTOM) {
                return;
            }

            $sum = $this->float('raw_material_pct')
                + $this->float('operational_pct')
                + $this->float('marketing_pct')
                + $this->float('profit_pct');

            if (abs($sum - 100) > 0.01) {
                $validator->errors()->add('profit_pct', 'Total persentase rumus harus 100% (sekarang '.number_format($sum, 2).'%).');
            }
        });
    }

    /**
     * Fill custom formula percentages, defaults to the preset when a preset is chosen.
     *
     * @return array{raw_material: float, operational: float, marketing: float, profit: float}
     */
    public function formulaPercentages(): array
    {
        if ($this->string('formula_type')->toString() !== Business::FORMULA_CUSTOM) {
            return Business::formulaPresets()[$this->string('formula_type')->toString()];
        }

        return [
            'raw_material' => $this->float('raw_material_pct'),
            'operational' => $this->float('operational_pct'),
            'marketing' => $this->float('marketing_pct'),
            'profit' => $this->float('profit_pct'),
        ];
    }
}
