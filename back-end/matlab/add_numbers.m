args = argv(); 

pd_filename = args{1};
all_ppv_data_filename = args{2};


pd_data = load(pd_filename);
pd_vars = fieldnames(pd_data);
Pd = pd_data.(pd_vars{1}); 
Pd_initial = Pd;  

% Load second file
ppv_data = load(all_ppv_data_filename);
ppv_vars = fieldnames(ppv_data);
all_Ppv_data = ppv_data.(ppv_vars{1});  


