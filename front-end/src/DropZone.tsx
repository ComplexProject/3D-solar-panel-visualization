import { useMemo } from 'react';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { IconoirProvider, CloudUpload, SmallLampAlt } from 'iconoir-react';

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
    accept: { 'image/*': [] },
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

  // const displayFileName = (fileName: string) => {
  //   if (fileName.length > 26) {
  //     return fileName.substring(0, 23) + '...';
  //   }
  //   return fileName;
  // };

  return (
    <div className="container">
      <div {...getRootProps({ style })} className='flex flex-col justify-center items-center p-5 border-2 rounded-xl hover:cursor-pointer hover:border-[#006FAA] border-[#808080] border-dashed'>
        <input {...getInputProps()} />
        <IconoirProvider
          iconProps={{
            color: '#000000',
            strokeWidth: 1.5,
            width: '24px',
            height: '24px',
          }}
        >
          {!file ? (<>
              <CloudUpload />
              <p>Drag & Drop your file</p> 
            </>)
            : (<>
              <div className='flex flex-row items-center w-full justify-center'>
                <SmallLampAlt />
                <p className='truncate'>{file.name}</p>
              </div> 
            </>)
          }
        </IconoirProvider>
        <p>Or</p>
        <button className=' rounded-[10px] bg-[#D9D9D9] h-8 px-3.5 hover:cursor-pointer hover:bg-[#a8a8a8]'>
          {!file ? "Browse files" : "Choose a different file"}
        </button>
      </div>
    </div>
  );
}

export default StyledDropzone