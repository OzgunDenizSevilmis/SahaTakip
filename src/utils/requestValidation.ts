import { z } from 'zod';

export const createRequestSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Başlık zorunludur.'),

  description: z
    .string()
    .trim()
    .min(1, 'Açıklama zorunludur.'),

    categoryId: z
    .string()
    .min(1, 'Kategori seçimi zorunludur.'),
    
    priority: z.enum(['low', 'medium', 'high'], { 
    message: 'Öncelik seçimi zorunludur.',
}),

});

export type CreateRequestFormValues = z.infer<typeof createRequestSchema>;