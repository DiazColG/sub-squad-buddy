import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FIRECalculator from "@/components/FIRECalculator";

export default function FIRE() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <FIRECalculator />
      <Card>
        <CardHeader>
          <CardTitle>FIRE: Independencia Financiera, Retiro Temprano</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral max-w-none">
          <p>
            La teoría de la independencia financiera que mencionas, conocida popularmente como la regla del 25,
            es un pilar fundamental del movimiento FIRE (Financial Independence, Retire Early), que en español
            significa "Independencia Financiera, Retiro Temprano".
          </p>
          <p>
            La idea central es muy simple: una vez que logras ahorrar e invertir un monto equivalente a 25 veces tus gastos anuales,
            has alcanzado la independencia financiera. A partir de ese punto, teóricamente, no necesitarías volver a trabajar por dinero,
            ya que podrías vivir de los rendimientos de tus inversiones.
          </p>
          <h3>¿Cómo Funciona Exactamente?</h3>
          <p>
            Esta regla se basa en otro concepto clave: la regla del 4%. Esta regla, derivada de un estudio conocido como el "Trinity Study",
            sugiere que puedes retirar de forma segura el 4% de tu portafolio de inversiones cada año sin agotar tu capital a lo largo del tiempo
            (considerando un horizonte de al menos 30 años).
          </p>
          <p>La matemática es directa:</p>
          <ul>
            <li>Si tienes 25 veces tus gastos anuales ahorrados (Tu "número FIRE").</li>
            <li>Y cada año retiras el 4% de ese total.</li>
            <li>Ese 4% que retiras equivale exactamente a un año de tus gastos.</li>
          </ul>
          <h4>Ejemplo práctico</h4>
          <p>
            Calcula tus gastos anuales: Supongamos que tus gastos mensuales son de $200.000 pesos. Anualmente, esto suma $2.400.000 pesos.
          </p>
          <p>
            Aplica la regla del 25: Multiplicas tus gastos anuales por 25.
          </p>
          <p>
            2.400.000×25=$60.000.000
          </p>
          <p>
            Tu número para la independencia financiera: En este ejemplo, necesitarías tener $60.000.000 de pesos invertidos.
          </p>
          <p>
            Aplica la regla del 4%: El 4% de $60.000.000 es $2.400.000, que es exactamente lo que necesitas para cubrir tus gastos de un año.
          </p>
          <p>
            La idea es que mientras tú retiras ese 4%, el 96% restante de tu portafolio sigue invertido, generando rendimientos que, en promedio,
            deberían ser iguales o superiores a la tasa de retiro más la inflación, permitiendo que tu capital se mantenga o incluso crezca.
          </p>
          <h3>Origen de la Teoría</h3>
          <p>
            Esta metodología fue popularizada a partir de los años 90. El concepto de la tasa de retiro segura del 4% proviene de un estudio de 1998
            realizado por tres profesores de la Universidad de Trinity, que analizaron datos históricos del mercado de acciones y bonos de Estados Unidos.
            Descubrieron que una cartera diversificada había soportado históricamente una tasa de retiro del 4% anual (ajustada por inflación) durante un
            período de 30 años sin agotarse.
          </p>
          <h3>Consideraciones y Críticas Importantes ⚠️</h3>
          <ul>
            <li><strong>Basado en datos históricos de EE.UU.:</strong> La regla del 4% se calculó con el mercado estadounidense, que no garantiza resultados futuros ni se aplica igual a otras economías.</li>
            <li><strong>Inflación:</strong> Asume rendimientos superiores a la inflación a largo plazo.</li>
            <li><strong>Impuestos y comisiones:</strong> Reducen el rendimiento neto y deben considerarse.</li>
            <li><strong>Flexibilidad en el gasto:</strong> Ajustar retiros en años malos puede extender la longevidad del portafolio.</li>
            <li><strong>Riesgo de secuencia de retornos:</strong> Pérdidas al inicio del retiro son más peligrosas que al final.</li>
          </ul>
          <p>
            En resumen, la teoría de ahorrar 25 veces tus gastos es una guía excelente y una meta clara para quienes buscan la independencia financiera.
            Sin embargo, debe ser tomada como un punto de partida y no como una regla rígida, adaptándola siempre a las circunstancias personales,
            económicas y al perfil de riesgo de cada individuo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
