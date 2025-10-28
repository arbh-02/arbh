export const leadOriginOptions = [
  { value: 'formulario', label: 'Formulário' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'redes_sociais', label: 'Redes Sociais' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'outros', label: 'Outros' },
] as const;

export type LeadOriginValue = typeof leadOriginOptions[number]['value'];

export const leadOriginValues = leadOriginOptions.map(option => option.value) as [LeadOriginValue, ...LeadOriginValue[]];

export const getLeadOriginLabel = (value: string | null | undefined) => {
  if (!value) return '';
  return leadOriginOptions.find(option => option.value === value)?.label || value;
};