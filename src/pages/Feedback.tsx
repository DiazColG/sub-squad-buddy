import { Layout } from "@/components/Layout";
import { FeedbackForm } from "@/components/FeedbackForm";

const Feedback = () => {
  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Feedback y Sugerencias</h1>
          <p className="text-muted-foreground">
            Comparte tus ideas y ayúdanos a mejorar la plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <FeedbackForm />
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 border border-primary/10">
              <h3 className="text-lg font-semibold mb-4 text-foreground">¿Cómo ayudas?</h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-foreground">Mejoras:</span> Sugiere cómo podemos mejorar las funciones existentes
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-foreground">Nuevas funciones:</span> Comparte ideas para nuevas características
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-foreground">Reportar errores:</span> Informa sobre problemas que encuentres
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-foreground">Comentarios generales:</span> Cualquier otra sugerencia o comentario
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-background/50 rounded-lg border">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Nota:</span> Tu feedback es valioso para nosotros. 
                  Revisamos todos los comentarios y los consideramos para futuras actualizaciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Feedback;