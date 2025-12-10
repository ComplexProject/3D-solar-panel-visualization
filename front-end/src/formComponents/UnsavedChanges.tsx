import FormButton from "./FormButton";

type UnsavedChangesProps = {
  onConfirm: () => void;
  onCancel: () => void;
}

function UnsavedChanges({ onConfirm, onCancel }: UnsavedChangesProps) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl w-1/4 bg-white absolute z-[100] p-5 drop-shadow-2xl">
      <h1 className=" text-3xl">Warning</h1>
      <p>You have unsaved changes, do you want to continue without saving?</p>
      <div className="flex flex-row gap-5">
        <FormButton buttonText="Yes, continue" isClosingButton={true} onClick={onConfirm}/>
        <FormButton buttonText="Cancel" onClick={onCancel}/>
      </div>
    </div>
  );
}

export default UnsavedChanges