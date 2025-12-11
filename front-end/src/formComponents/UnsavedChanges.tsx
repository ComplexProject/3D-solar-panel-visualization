import FormButton from "./FormButton";
import { useEffect } from "react";

type UnsavedChangesProps = {
  onConfirm: () => void;
  onCancel: () => void;
}

function UnsavedChanges({ onConfirm, onCancel }: UnsavedChangesProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  
  return (
    <div className="flex justify-center items-center w-screen h-screen backdrop-blur-md bg-gray-500/50 fixed inset-0 z-[90]">
    <div className="flex flex-col gap-5 rounded-2xl w-1/4 bg-white p-5 drop-shadow-2xl">
      <h1 className=" text-3xl">Warning</h1>
      <p>You have unsaved changes, do you want to continue without saving?</p>
      <div className="flex flex-row gap-5">
        <FormButton buttonText="Yes, continue" isClosingButton={true} onClick={onConfirm}/>
        <FormButton buttonText="Cancel" onClick={onCancel}/>
      </div>
    </div>
    </div>
  );
}

export default UnsavedChanges