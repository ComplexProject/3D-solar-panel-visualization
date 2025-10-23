% PV_Calculation is a scriptfile used for calculating the different PV combinations
%
% Copyrights HyMatters Research & Consultancy BV
%
% Daniel Hof, Bemmel, 03 December 2024

if strcmp(messages, 'on')
  disp('> Start calculations for different PV orientations ...')
end
%

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

  if strcmp (messages, 'on')
    disp(['>> Current iteration: ' num2str(i) '.   Usable energy from PV: ' num2str(Pusable/1000) ' [kWh/year].   Electricity from grid: ' num2str(sum(Pd)/1000) ' [kWh/year].'])
  end

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
if strcmp(messages, 'on')

  disp('> Summary of all PV orientations and capacities:')

  for a = 1:size(all_Ppv_data, 2)

    for s = 1:size(all_Ppv_data, 1)

      if PV_distribution(s, a) ~= 0
        disp(['>> ' num2str(PV_distribution(s,a)) ' kWp with ' num2str(x_azimuth(a)) '° azimuth and ' num2str(y_slope(s)) '° slope.'])
      end

    end

  end

  disp(['> In total ' num2str(sum(PV_distribution(:))) ' [kWp] of PV can be used effectively.'])

end
%


if strcmp(messages, 'on')
  disp('> Optimalisation of PV distribution complete.')
 end
%
