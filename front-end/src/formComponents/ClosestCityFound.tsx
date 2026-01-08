import FormButton from "./FormButton";
import { useEffect } from "react";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
  distance: number;
}

/**
 * React component that has the styling of the ClosestCityFound component
 * @returns Closest city found changes component
 */
function ClosestCityFound({ onConfirm, onCancel, distance }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  
  return (
    <div className="flex justify-center items-center w-screen h-screen backdrop-blur-md bg-gray-500/50 fixed inset-0 z-[90]">
    <div className="flex flex-col gap-5 rounded-2xl w-1/4 bg-white p-5 drop-shadow-2xl">
      <h1 className=" text-3xl">Alternative</h1>
      <p>We found an alternative city within ~{distance} km. You can use this to get your results much faster. Do you wish to use this new city?</p>
      <div className="flex flex-row gap-5">
        <FormButton buttonText="Yes" onClick={onConfirm}/>
        <FormButton buttonText="Cancel" isClosingButton={true} onClick={onCancel}/>
      </div>
    </div>
    </div>
  );
}

export default ClosestCityFound