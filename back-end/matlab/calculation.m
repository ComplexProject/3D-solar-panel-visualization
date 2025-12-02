% PV_Calculation is a scriptfile used for calculating the different PV combinations
%
% Copyrights HyMatters Research & Consultancy BV
%
% Daniel Hof, Bemmel, 03 December 2024
%
%
% Added changes to make it run with other services
% Jessica Dinova, Simon Manassé, Middelburg, 23 October 2025


messages = 'on';  


% Taking in argument from python
args = argv(); 

pd_filename = args{1};
all_ppv_data_filename = args{2};
azimuth = str2double(args{3});
slope = str2double(args{4});


pd_data = load(pd_filename);
pd_vars = fieldnames(pd_data);
Pd = pd_data.(pd_vars{1}); 
Pd_initial = Pd;  

% Load second file
ppv_data = load(all_ppv_data_filename);
ppv_vars = fieldnames(ppv_data);
all_Ppv_data = ppv_data.(ppv_vars{1});  


azimuth_res = azimuth;       
slope_res = slope;

% Predifined variables
x_azimuth = -90:azimuth_res:90;
y_slope =  0:size(all_Ppv_data, 1)-1;
simulation_summary = zeros(400, 4);                            
orientation_summary = zeros(400, 2);
Pd_summary = cell(400, 1);
electricity_costs = 0.13/1000;        
PV_t = 20;     
Ppv_max = 10;
PV_cost = 1200;
PV_capex = PV_cost * Ppv_max;
cost_reduction =inf;
azimuth_array = [-90:azimuth_res:90];
slope_array = [0:slope_res:90];
PV_distribution = zeros(length(slope_array),length(azimuth_array));








% Pgrid first iterration
sum_Pgrid_old = sum(Pd);


% Loop for calculating effects of different PV orientations
i=1;
while cost_reduction > PV_capex            % maybe better to rename Pgrid to Pd

  % Subtract the power generation of the PV panels from the demand. Limit to 0 (because no backdelivery)
  Pgrid_new = cellfun(@(x) max(0,Pd-Ppv_max*x),all_Ppv_data, 'UniformOutput', false);

  % Calculate year sum of Pgrid
  sum_Pgrid_all = cellfun(@sum, Pgrid_new);

  % Find the index of the minimum of sum of Pgrid
  [sum_Pgrid_min, min_index] = min(sum_Pgrid_all(:));
  [row_index, col_index] = ind2sub(size(sum_Pgrid_all), min_index);

  % Keep track of the PV orientation
  orientation_summary(i,:) = [row_index, col_index];

  % Keep track of the panel orientation
  PV_distribution(row_index, col_index) = PV_distribution(row_index, col_index) + Ppv_max;                 % PV distribution is increased based on the 'step size' defined in Ppv_max [kWp]

  % Calculate usable enegy and cost reduction
  Pusable = sum_Pgrid_old - sum_Pgrid_all(row_index, col_index);
  cost_reduction = Pusable * electricity_costs * PV_t;

  % Redefine 'Pd' and 'sum_Pgrid_old' for the next itteration
  Pd = Pgrid_new{row_index, col_index};
  sum_Pgrid_old = sum_Pgrid_min;

  % Save the results inside a [matrix of 400 by 3]
  simulation_summary(i,:) = [PV_capex, Pusable, cost_reduction, sum(Pd)];        % values PV_capex [€], Pusable [Wh], cost_reduction [€], Demand profile electric energy [Wh]

  % Save the demand profile inside a cell array [400 by 2]
  Pd_summary{i} = Pd;


  % Increase variable for keeping track of the itteration
  i = i + 1;

end

% Re-sizing 'simulation_summary' matrix
simulation_summary = simulation_summary(1:i-1, :);        % For 'i-1' includes itteration which falls below payback period; 'i-2' excludes this itteration
Pd_summary = Pd_summary(1:i-1, :);
orientation_summary = orientation_summary(1:i-1, :);


% Calculating usable Ppv over the simulation time
Ppv_usable = (Pd_initial - Pd_summary{length(Pd_summary)});                            % profile of usable electricity from PV
Ppv_usable_tot = sum(Ppv_usable);                                                      % Total USABLE Ppv
Ppv_percentage = 100/sum(Pd_initial)*Ppv_usable_tot;                                   % TOTAL percentage of Ppv


% Calculations with single 'most efficient' orientation of Ppv ( SO = Single Orientation)
Ppv_SO =  all_Ppv_data{orientation_summary(1,1), orientation_summary(1,2)}.* Ppv_max .* length(orientation_summary);
Pd_SO = max(0, Pd_initial - Ppv_SO);
Ppv_usable_SO = Pd_initial - Pd_SO;
Ppv_usable_SO_total = sum(Ppv_usable_SO);

% Calculating percentages
Ppv_SO_percentage = 100/sum(Pd_initial)*Ppv_usable_SO_total;


% Generate automated text which describes how much [kWp] has a given orientation
% if strcmp(messages, 'on')

%   disp('> Summary of all PV orientations and capacities:')

%   for a = 1:size(all_Ppv_data, 2)

%     for s = 1:size(all_Ppv_data, 1)

%       if PV_distribution(s, a) ~= 0
%         disp(['>> ' num2str(PV_distribution(s,a)) ' kWp with ' num2str(x_azimuth(a)) '° azimuth and ' num2str(y_slope(s)) '° slope.'])
%       end

%     end

%   end

%   disp(['> In total ' num2str(sum(PV_distribution(:))) ' [kWp] of PV can be used effectively.'])

% end

% Collect all panels
panel_idx = 1;
panels_json = {};
for a = 1:size(all_Ppv_data, 2)
    for s = 1:size(all_Ppv_data, 1)
        if PV_distribution(s, a) ~= 0
            panels_json{end+1} = sprintf('"panel%d": {"kpw": %d, "azimuth": %d, "slope": %d}', ...
                                         panel_idx, PV_distribution(s,a), x_azimuth(a), y_slope(s));
            panel_idx = panel_idx + 1;
        end
    end
end

% Join panel entries
panels_str = strjoin(panels_json, ',');

% Create panels JSON object
panels_object = sprintf('"panels": { %s }', panels_str);

% Add totals
Ppv_usable = Pd_initial - Pd_summary{end};
Ppv_usable_tot = sum(Ppv_usable);
Ppv_percentage = 100 * Ppv_usable_tot / sum(Pd_initial);

% Build final JSON string
json_str = sprintf('{%s,"ppv_usable": %.2f,"ppv_percentage": %.2f,"energy_from_grid": %.2f}', ...
                   panels_object, Ppv_usable_tot, Ppv_percentage, sum(Pd_initial));

% Print only JSON
fprintf('%s\n', json_str);


