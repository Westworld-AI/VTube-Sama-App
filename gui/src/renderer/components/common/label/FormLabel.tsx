interface FormLabelProps {
  title: string; // 字段的名称
  description: string; // 字段的描述
}

const FormLabel: React.FC<FormLabelProps> = ({title, description}) => {
  return (
    <div>
      <div style={{fontWeight: 'bold'}}>{title}</div>
      <div style={{fontSize: 'smaller', color: 'gray'}}>{description}</div>
    </div>
  );
};

export default FormLabel
