import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  error?: string[];
  description?: string;
}

export function FormTextarea({
  label,
  name,
  error,
  description,
  className,
  ...props
}: FormTextareaProps) {
  return (
    <div className="mb-4">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {description && (
        <p className="text-sm text-gray-500 mt-1 mb-2">{description}</p>
      )}

      <Textarea
        id={name}
        name={name}
        aria-describedby={`${name}-error`}
        className={`${error ? 'border-red-500' : ''} ${className || ''}`}
        {...props}
      />

      <div id={`${name}-error`} aria-live="polite">
        {error?.map((err, i) => (
          <p key={i} className="text-red-500 text-sm mt-1">⚠️ {err}</p>
        ))}
      </div>
    </div>
  );
}
