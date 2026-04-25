interface MessageProps {
  message: string;
}

export function ErrorMessage({ message }: MessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
      {message}
    </p>
  );
}

export function SuccessMessage({ message }: MessageProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
      {message}
    </p>
  );
}
