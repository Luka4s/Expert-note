import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, MouseEvent, useState } from "react";
import { toast } from "sonner";

interface onNoteCreatedProps {
  onNoteCreated: (content: string) => void;
}

let speechRecognition: speechRecognition | null = null;

export function NewNoteCard({ onNoteCreated }: onNoteCreatedProps) {
  const [shouldShowOnBoard, setshouldShowOnBoard] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [content, setContent] = useState("");

  function handleStartEditor() {
    setshouldShowOnBoard(false);
  }

  function handleStopEditor() {
    setshouldShowOnBoard(true);
  }

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value);

    if (event.target.value === "") {
      setshouldShowOnBoard(true);
    }
  }

  function handleSaveNote(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    if (content === "") {
      return;
    }

    onNoteCreated(content);
    setshouldShowOnBoard(true);

    setContent("");

    toast.success("Nota criada com sucesso");
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
    if (!isSpeechRecognitionAPIAvailable) {
      alert("Infelizmente sue navegador não suporta a API de gravação!");
      return;
    }
    setIsRecording(true);
    setshouldShowOnBoard(false);

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    speechRecognition = new SpeechRecognitionAPI();

    speechRecognition.lang = "pt-BR" || "en";
    speechRecognition.continuous = true;
    speechRecognition.maxAlternatives = 1;
    speechRecognition.interimResults = true;

    speechRecognition.onresult = (e) => {
      const transcripition = Array.from(e.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, "");

      setContent(transcripition);
    };

    speechRecognition.onerror = (e: { error: any }) => {
      console.log(e.error);
    };

    speechRecognition.start();
  }

  function handleStopRecording() {
    setIsRecording(false);

    if (speechRecognition !== null) {
      speechRecognition.stop();
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 text-left p-5 gap-y-3 overflow-hidden relative outline-none hover:ring-2 hover: ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
        <span className="text-sm font-medium text-slate-200">
          adicionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400">
          Grave uma nota em áudio que será convertido para texto automaticamente
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50">
          <Dialog.Content className="fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] md:h-[60vh] w-full bg-slate-700 md:rounded-md flex flex-col outline-none overflow-hidden">
            <Dialog.Close
              onClick={handleStopEditor}
              className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-300"
            >
              <X className="size-5" />
            </Dialog.Close>
            <form className="flex-1 flex flex-col">
              <div className="flex flex-1 flex-col gap-3 p-5">
                <span className="text-sm font-medium text-slate-300">
                  Adicionar Nota
                </span>
                {shouldShowOnBoard ? (
                  <p className="text-sm leading-6 text-slate-400">
                    Comece{" "}
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="font-medium text-lime-400 hover:underline"
                    >
                      gravando uma nota em áudio
                    </button>{" "}
                    ou se preferir{" "}
                    <button
                      type="button"
                      onClick={handleStartEditor}
                      className="font-medium text-lime-400 hover:underline"
                    >
                      utilize apenas texto.
                    </button>
                  </p>
                ) : (
                  <textarea
                    autoFocus
                    className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                    onChange={handleContentChange}
                    value={content}
                  />
                )}
              </div>

              {isRecording ? (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100"
                >
                  <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                  Gravando! (Clique para interromper)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
                >
                  Salvar nota
                </button>
              )}
            </form>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
