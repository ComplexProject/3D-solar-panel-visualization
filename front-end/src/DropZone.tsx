import {useMemo} from 'react';
import { useState } from 'react';
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
  const [file, setFile] = useState<File | undefined>(undefined);

  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject
  } = useDropzone({
    accept: {'image/*': []},
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const droppedFile = acceptedFiles[0];
        console.log("dropped", droppedFile.name);
        setFile(droppedFile);
      }
    }
  });

  const style = useMemo(() => ({
    ...(isFocused ? focusedStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isFocused,
    isDragAccept,
    isDragReject
  ]);

  const displayFileName = (fileName: string) => {
    if (fileName.length > 26) {
      return fileName.substring(0, 23) + '...';
    }
    return fileName;
  };

  return (
    <div className="container">
      <div {...getRootProps({style})} className='flex flex-col justify-center items-center p-5 border-2 rounded-xl hover:cursor-pointer hover:border-[#006FAA] border-[#808080] border-dashed'>
        <input {...getInputProps()} />
        {!file ? ( <>
        <svg width="24px" height="24px" strokeWidth={1.5} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M12 22V13M12 13L15.5 16.5M12 13L8.5 16.5" stroke="#000000" strokeWidth={1.5} strokeLinecap='round' strokeLinejoin='round'></path><path d="M20 17.6073C21.4937 17.0221 23 15.6889 23 13C23 9 19.6667 8 18 8C18 6 18 2 12 2C6 2 6 6 6 8C4.33333 8 1 9 1 13C1 15.6889 2.50628 17.0221 4 17.6073" stroke="#000000" strokeWidth={1.5} strokeLinecap='round' strokeLinejoin='round'></path></svg>
            <p>Drag & Drop your file</p> </>)
          :( <>
          <div className='flex flex-row items-center'>
            <svg width="30px" height="30px" viewBox="0 0 24 24" stroke-width="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M6.87172 3.42759L4.23172 12.2276C4.11623 12.6126 4.4045 13 4.80642 13L19.1936 13C19.5955 13 19.8838 12.6126 19.7683 12.2276L17.1283 3.42759C17.0521 3.1738 16.8185 3 16.5536 3L7.44642 3C7.18145 3 6.94786 3.1738 6.87172 3.42759Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 15L8 13" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8 21H16M12 15L12 21" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
            <p>{displayFileName(file.name)}</p>
          </div> </>)
        }
        <p>Or</p>
      <button className=' rounded-[10px] bg-[#D9D9D9] h-8 px-3.5 hover:cursor-pointer hover:bg-[#a8a8a8]'>
            Browse files
      </button>
      </div>
    </div>
  );
}

export default StyledDropzone