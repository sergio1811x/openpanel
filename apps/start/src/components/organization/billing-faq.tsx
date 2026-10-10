import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Widget, WidgetHead } from '@/components/widget';

const questions = [
  {
    question: 'Есть ли у OpenPanel бесплатный тариф?',
    answer: [
      'Для облачного тарифа (Cloud) мы предлагаем 30 дней бесплатного trial — он нужен, чтобы попробовать OpenPanel до перехода на платный тариф.',
      'OpenPanel также имеет открытый исходный код, и Вы можете развернуть его самостоятельно бесплатно!',
      '',
      'Почему у OpenPanel нет бесплатного тарифа?',
      'Мы хотим быть уверены, что OpenPanel используют те, кто настроен серьёзно. Нам также нужно вкладывать время и ресурсы в поддержку платформы и наших пользователей.',
    ],
  },
  {
    question: 'Что произойдёт, если мой сайт превысит лимит?',
    answer: [
      "Вы не будете видеть новые события в OpenPanel до следующего расчётного периода. Если это повторится 2 месяца подряд, мы порекомендуем повысить тариф.",
    ],
  },
  {
    question: 'Что произойдёт, если я отменю подписку?',
    answer: [
      'Если Вы отмените подписку, доступ к OpenPanel сохранится до конца текущего расчётного периода. Возобновить подписку можно в любой момент.',
      'После окончания текущего расчётного периода доступ к новым данным прекратится.',
      "ПРИМЕЧАНИЕ: если Ваш аккаунт неактивен 3 месяца, мы удалим Ваши события.",
    ],
  },
  {
    question: 'Как изменить платёжные данные?',
    answer: [
      'Платёжные данные можно изменить, нажав кнопку «Клиентский портал» в разделе биллинга.',
    ],
  },
  {
    question: 'Нам нужен индивидуальный тариф, можете помочь?',
    answer: [
      'Да, мы можем помочь. Напишите нам на hello@openpanel.dev, чтобы запросить расчёт стоимости.',
    ],
  },
];

export function BillingFaq() {
  return (
    <Widget className="w-full">
      <WidgetHead className="flex items-center justify-between">
        <span className="title">Часто задаваемые вопросы</span>
      </WidgetHead>
      <Accordion
        className="w-full max-w-screen-md self-center"
        collapsible
        type="single"
      >
        {questions.map((q) => (
          <AccordionItem key={q.question} value={q.question}>
            <AccordionTrigger className="px-4 text-left">
              {q.question}
            </AccordionTrigger>
            <AccordionContent>
              <div className="col gap-2 p-4 pt-2">
                {q.answer.map((a) => (
                  <p key={a}>{a}</p>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Widget>
  );
}
