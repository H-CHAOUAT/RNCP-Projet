import Label from "../atoms/Label";
import Input from "../atoms/Input";

export default function FormField({ label, type, value, onChange, placeholder }) {
    return (
        <div className="mb-4">
            <Label>{label}</Label>
            <Input type={type} value={value} onChange={onChange} placeholder={placeholder} />
        </div>
    );
}
