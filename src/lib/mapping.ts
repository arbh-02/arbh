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

export const leadStatusOptions = [
  { value: 'novo', label: 'Novo' },
  { value: 'atendimento', label: 'Atendimento' },
  { value: 'ganho', label: 'Ganho' },
  { value: 'perdido', label: 'Perdido' },
] as const;

export type LeadStatusValue = typeof leadStatusOptions[number]['value'];

export const leadStatusValues = leadStatusOptions.map(option => option.value) as [LeadStatusValue, ...LeadStatusValue[]];

export const getLeadStatusLabel = (value: string | null | undefined) => {
  if (!value) return '';
  return leadStatusOptions.find(option => option.value === value)?.label || value;
};