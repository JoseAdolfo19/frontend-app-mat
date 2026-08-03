import { TRUE_FALSE_OPTIONS } from './constants';

export const normalizeTrueFalse = (answer) => {
  if (answer === true || answer === 'true') return 'true';
  if (answer === false || answer === 'false') return 'false';
  const matched = TRUE_FALSE_OPTIONS.find((opt) => opt.labelKey && opt.value);
  return matched ? matched.value : answer;
};

export const isAnswerCorrect = ({ type, correctAnswer, userAnswer }) => {
  if (userAnswer === undefined || userAnswer === null || userAnswer === '') return false;

  if (type === 'true_false') {
    return normalizeTrueFalse(correctAnswer) === normalizeTrueFalse(userAnswer);
  }

  if (type === 'drag_drop') {
    const expected = Array.isArray(correctAnswer)
      ? correctAnswer
      : (() => {
          try {
            return JSON.parse(correctAnswer || '[]');
          } catch {
            return [];
          }
        })();
    const given = Array.isArray(userAnswer) ? userAnswer : [];
    if (expected.length !== given.length) return false;
    return expected.every((item, i) => item === given[i]);
  }

  return String(correctAnswer) === String(userAnswer);
};

export const gradeExam = (questions, userAnswers) => {
  let correct = 0;
  let total = 0;

  for (const question of questions || []) {
    const points = Number(question.points) || 1;
    total += points;
    const correctAnswer =
      question.correct_answer !== undefined ? question.correct_answer : question.correctAnswer;
    if (isAnswerCorrect({
      type: question.type,
      correctAnswer,
      userAnswer: userAnswers[question.id],
    })) {
      correct += points;
    }
  }

  return {
    correctAnswers: correct,
    totalPoints: total,
    score: total > 0 ? (correct / total) * 20 : 0,
    passed: total > 0 && correct / total >= 0.6,
  };
};
