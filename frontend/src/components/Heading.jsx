export default function Heading({ level = 2, children, className = "" }) {
  const Tag = `h${level}`;
  return <Tag className={className}>{children}</Tag>;
}
