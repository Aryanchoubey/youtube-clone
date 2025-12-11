export const Overlay = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div onClick={onClose} className="  fixed z-30 bottom-0  w-screen h-screen p-4 bg-black/85 ">
          <div className="absolute inset-0 bg-black opacity-50" />
        </div>
      )}
    </>
  )
}