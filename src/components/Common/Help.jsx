import React, { useState } from 'react';
import { FaQuestionCircle, FaChevronDown, FaEnvelope, FaBook } from 'react-icons/fa';

const faqs = [
  {
    question: '¿Cómo empiezo una lección?',
    answer: 'Ve a la sección "Lecciones" en el menú lateral, elige la que quieras y haz clic en ella. Podrás avanzar tu progreso marcándola como completada al terminar.',
  },
  {
    question: '¿Cómo veo mis resultados de una evaluación?',
    answer: 'En la sección "Evaluaciones", las que ya completaste muestran el botón "Ver resultados" con tu calificación y revisión de respuestas.',
  },
  {
    question: '¿Puedo cambiar mi contraseña?',
    answer: 'Sí, ve a Ajustes → Editar perfil y contraseña, o directamente a tu página de Perfil. Si iniciaste sesión con Google, tu contraseña se administra desde tu cuenta de Google.',
  },
  {
    question: '¿Qué hago si no encuentro una lección o evaluación?',
    answer: 'Es posible que tu docente aún no la haya publicado. Contáctalo directamente.',
  },
  {
    question: '¿Cómo reporto un error en la plataforma?',
    answer: 'Escríbenos a soporte con una descripción del problema y, si puedes, una captura de pantalla. Intentamos responder en menos de 48 horas.',
  },
];

const Help = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <FaQuestionCircle className="mx-auto text-4xl text-[var(--primary)] mb-3" />
        <h2 className="text-3xl font-bold text-[var(--on-surface)]">Centro de Ayuda</h2>
        <p className="text-[var(--on-surface-variant)]">
          Encuentra respuestas a las preguntas más frecuentes
        </p>
      </div>

      {/* FAQ */}
      <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--surface-container)] overflow-hidden">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-[var(--surface-container)] last:border-b-0">
            <button
              onClick={() => toggleFaq(index)}
              className="w-full flex justify-between items-center p-5 text-left hover:bg-[var(--surface-container-low)] transition-colors"
            >
              <span className="font-medium text-[var(--on-surface)]">{faq.question}</span>
              <FaChevronDown
                className={`text-[var(--on-surface-variant)] transition-transform flex-shrink-0 ml-4 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="px-5 pb-5 text-[var(--on-surface-variant)] text-sm leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contacto */}
      <div className="bg-[var(--primary)] rounded-2xl p-8 text-white text-center">
        <FaEnvelope className="mx-auto text-3xl mb-3" />
        <h3 className="text-xl font-bold mb-2">¿No encontraste lo que buscabas?</h3>
        <p className="text-blue-100 mb-4">Escríbenos y te ayudamos personalmente</p>
        <a
          href="mailto:ibericosunaa@gmail.com"
          className="inline-block px-6 py-3 bg-white text-[var(--primary)] font-bold rounded-xl hover:shadow-lg transition-all"
        >
          ibericosunaa@gmail.com
        </a>
      </div>

      {/* Recurso adicional */}
      <div className="flex items-center gap-3 p-5 bg-[var(--surface-container-low)] rounded-2xl">
        <FaBook className="text-[var(--primary)] text-xl flex-shrink-0" />
        <p className="text-sm text-[var(--on-surface-variant)]">
          Consejo: revisa la sección "Lecciones" antes de una evaluación — cada tema incluye recursos de apoyo (PDF, videos) que pueden ayudarte a prepararte mejor.
        </p>
      </div>
    </div>
  );
};

export default Help;