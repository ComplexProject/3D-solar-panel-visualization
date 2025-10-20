import {useMemo} from 'react';
import {useDropzone} from 'react-dropzone';

const focusedStyle: React.CSSProperties = {
  borderColor: '#2196f3'
};

const acceptStyle: React.CSSProperties = {
  borderColor: '#00e676'
};

const rejectStyle: React.CSSProperties = {
  borderColor: '#ff1744'
};

function StyledDropzone() {
  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject
  } = useDropzone({accept: {'image/*': []}});

  const style = useMemo(() => ({
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isFocused,
    isDragAccept,
    isDragReject
  ]);

  return (
    <div className="container">
      <div {...getRootProps({style})} className='flex flex-col justify-center items-center p-5 border-2 rounded-xl hover:cursor-pointer hover:border-[#006FAA] border-[#808080] border-dashed'>
        <svg width="24px" height="24px" strokeWidth={1.5} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M12 22V13M12 13L15.5 16.5M12 13L8.5 16.5" stroke="#000000" strokeWidth={1.5} strokeLinecap='round' strokeLinejoin='round'></path><path d="M20 17.6073C21.4937 17.0221 23 15.6889 23 13C23 9 19.6667 8 18 8C18 6 18 2 12 2C6 2 6 6 6 8C4.33333 8 1 9 1 13C1 15.6889 2.50628 17.0221 4 17.6073" stroke="#000000" strokeWidth={1.5} strokeLinecap='round' strokeLinejoin='round'></path></svg>
        <input {...getInputProps()} />
        <p>Drag & Drop your file</p>
        <p>Or</p>
      <button className=' rounded-[10px] bg-[#D9D9D9] h-8 px-3.5 hover:cursor-pointer hover:bg-[#a8a8a8]'>
            Browse files
      </button>
      </div>
    </div>
  );
}

export default StyledDropzone