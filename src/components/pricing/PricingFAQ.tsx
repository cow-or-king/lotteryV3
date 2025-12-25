/**
 * FAQ section for pricing page
 */
const faqs = [
  {
    question: 'Puis-je changer de plan à tout moment ?',
    answer:
      'Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Les changements sont effectifs immédiatement et la facturation est ajustée au prorata.',
  },
  {
    question: "L'essai gratuit nécessite-t-il une carte bancaire ?",
    answer:
      "Non, vous pouvez commencer votre essai gratuit de 14 jours sans fournir de carte bancaire. Vous ne serez facturé qu'après avoir choisi un plan payant.",
  },
  {
    question: 'Que se passe-t-il si je dépasse mon quota de participations ?',
    answer:
      'Nous vous préviendrons par email lorsque vous atteindrez 80% de votre quota. Vous pourrez alors passer à un plan supérieur ou acheter des participations supplémentaires à la carte.',
  },
  {
    question: 'Proposez-vous des réductions pour les associations ?',
    answer:
      'Oui, nous offrons des réductions de 30% pour les associations à but non lucratif et les organisations caritatives. Contactez-nous pour en savoir plus.',
  },
  {
    question: 'Puis-je annuler mon abonnement à tout moment ?',
    answer:
      "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. Votre accès restera actif jusqu'à la fin de la période payée, sans renouvellement automatique.",
  },
  {
    question: 'Les tarifs incluent-ils toutes les fonctionnalités ?',
    answer:
      "Oui, tous les tarifs incluent l'accès complet aux fonctionnalités de votre plan, les mises à jour, le support et l'hébergement. Aucun frais caché.",
  },
];

export function PricingFAQ() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
          <p className="text-xl text-gray-600">Tout ce que vous devez savoir sur nos tarifs</p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
