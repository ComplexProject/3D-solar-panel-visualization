args = argv(); 

if numel(args) < 2
    error('You must provide two numbers, e.g., octave add_numbers.m 3 5');
end

x = str2double(args{1});
y = str2double(args{2});
z = x + y;

printf('Added together %g and %g equals %g\n', x, y, z);
