import { describe, it, expect } from 'vitest';
import { examSchema } from './ExamEditor';

const validQuestion = {
  question_text: '¿Cuánto es 2+2?',
  points: 1,
};

describe('ExamEditor examSchema', () => {
  it('acepta un examen válido con título y al menos una pregunta', async () => {
    const value = await examSchema.validate({
      title: 'Examen de Álgebra',
      questions: [validQuestion],
    });
    expect(value.title).toBe('Examen de Álgebra');
    expect(value.questions).toHaveLength(1);
  });

  it('rechaza un título demasiado corto', async () => {
    await expect(
      examSchema.validate({ title: 'a', questions: [validQuestion] })
    ).rejects.toThrow();
  });

  it('rechaza un título vacío', async () => {
    await expect(
      examSchema.validate({ title: '', questions: [validQuestion] })
    ).rejects.toThrow();
  });

  it('rechaza un examen sin preguntas', async () => {
    await expect(
      examSchema.validate({ title: 'Título válido', questions: [] })
    ).rejects.toThrow();
  });

  it('rechaza una pregunta sin texto', async () => {
    await expect(
      examSchema.validate({
        title: 'Título válido',
        questions: [{ question_text: '', points: 1 }],
      })
    ).rejects.toThrow();
  });

  it('rechaza una pregunta con puntos menores a 1', async () => {
    await expect(
      examSchema.validate({
        title: 'Título válido',
        questions: [{ question_text: 'Pregunta', points: 0 }],
      })
    ).rejects.toThrow();
  });

  it('recoge todos los errores con abortEarly false', async () => {
    try {
      await examSchema.validate(
        { title: '', questions: [{ question_text: '', points: 0 }] },
        { abortEarly: false }
      );
      throw new Error('no debió validar');
    } catch (err) {
      const paths = err.inner.map((e) => e.path);
      expect(paths).toContain('title');
      expect(paths).toContain('questions[0].question_text');
      expect(paths).toContain('questions[0].points');
    }
  });
});