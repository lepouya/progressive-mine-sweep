export function saveToFile(fileName: string, contents: string | Blob) {
  if (!(contents instanceof Blob)) {
    contents = new Blob([contents], { type: "text/plain" });
  }
  const url = URL.createObjectURL(contents);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(url);
}

export function loadFromFile(
  onSuccess?: (contents: string) => void,
  onError?: () => void,
) {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.addEventListener(
    "change",
    function (changeEvent) {
      const files = (changeEvent.target as HTMLInputElement).files;
      if (!files || files.length === 0 || !files[0]) {
        if (onError) {
          onError();
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = function (loadEvent) {
        const contents = loadEvent.target?.result;
        if (!contents || typeof contents !== "string") {
          if (onError) {
            onError();
          }
          return;
        }

        if (onSuccess) {
          onSuccess(contents);
        }
      };

      reader.readAsText(files[0]);
    },
    false,
  );

  fileInput.click();
}
