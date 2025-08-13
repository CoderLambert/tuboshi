export default function TestPage({
  children,
}: {
  children: React.ReactNode
}) { 
    return (
        <div className="container w-full p-4 prose">
            <div>
                {children}
            </div>
        </div>
    )

}