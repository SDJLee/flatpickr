import { Plugin } from 'types/options';
import { Instance } from 'types/instance';

export interface Config {
  minYear?: number;
  maxYear?: number;
}

const defaultConfig: Config = {
  // By default minimum year is set to 1900.
  minYear: 1900,
  // By default maximum year is set to 2099.
  maxYear: 2099
};

const KEY_CODES = {
  ENTER: 13
};

const EVENTS = {
  BLUR: 'blur',
  CLICK: 'click',
  MOUSEDOWN: 'mousedown',
  FOCUS: 'focus',
  CHANGE: 'change',
  KEYDOWN: 'keydown'
};

function yearMonthSelection(pluginConfig: Config): Plugin {
  const config = { ...defaultConfig, ...pluginConfig };

  return function(fp: Instance) {
    if (fp.config.noCalendar) return {};
    let yearSelector: HTMLSelectElement;

    /**
     * Util function to toggle the classname in the element.
     * @param elem Element on which given class name is to be modified
     * @param className Classname to be added/removed
     * @param bool true to add the class and false to remove the class
     */
    function toggleClass(elem: HTMLElement, className: string, bool: boolean) {
      if (bool === true) {
        elem.classList.add(className);
      } else {
        elem.classList.remove(className);
      }
    }

    return {
      /**
       * onOpen hook is used to update the flatpickr calendar to display current
       * year and month calendar if there is no date selected previously.
       */
      onOpen() {
        const selectedDates = fp.selectedDates;
        let currentYear: number, currentMonth: number, selectedDate: Date;
        if (selectedDates && selectedDates.length > 0) {
          selectedDate = selectedDates[0];
        } else {
          selectedDate = new Date();
        }
        currentYear = selectedDate.getFullYear();
        currentMonth = selectedDate.getMonth();

        fp.changeYear(currentYear);
        fp.changeMonth(currentMonth, false);
        if (yearSelector) {
          yearSelector.value = currentYear.toString();
        }
      },

      /**
       * onYearChange hook is used to update the year selection <select> element with
       * the year from flatpickr when the year is changed programmaticallly.
       * For eg, when the user changes the month from December to January, the year
       * changes internally. Flatpickr fires 'onYearChange' hook internally.
       */
      onYearChange() {
        if (yearSelector) {
          yearSelector.value = fp.currentYear.toString();
        }
      },

      /**
       * onValueUpdate hook used to
       * - Update the lastSelectedDate on selecting a date.
       * - Update the year select element with the updated year value.
       */
      onValueUpdate() {
        if (yearSelector) {
          yearSelector.value = fp.currentYear.toString();
        }
      },

      /**
       * In onReady hook, a new year selection select element is created with a
       * range of given minYear to maxYear range in config. The default year
       * text input field provided in flatpickr is replaced with created select
       * element.
       */
      onReady() {
        yearSelector = yearSelectElement(config.minYear, config.maxYear);
        const yearSelectContainer: HTMLElement = document.createElement('div');
        yearSelectContainer.classList.add('flatpickr-year-select');
        yearSelectContainer.classList.add('numInputWrapper');
        yearSelectContainer.appendChild(yearSelector);

        /*
         * 'mousedown', 'click' and 'focus' events are bound to the year selection <select> element
         * to stop the event from bubbling to flatpickr event handler. This is done
         * to prevent select element from flatpickr event handler which rendered
         * it un-openable.
         */
        fp._bind(
          yearSelector,
          [EVENTS.CLICK, EVENTS.MOUSEDOWN, EVENTS.FOCUS],
          function(e) {
            e.stopPropagation();
          }
        );

        /*
         * 'change' event is bound to the year selection <select> element so that
         * the select element triggers the flatpickr's changeYear event in updating
         * flatpickr with selected year.
         */
        fp._bind(yearSelector, EVENTS.CHANGE, function(e) {
          fp.changeYear(parseInt(yearSelector.value));
        });

        // Below code is to replace the flatpickr's year input textbox with generated year selection <select> element.
        const currentMonthHeader = fp.calendarContainer.getElementsByClassName(
          'flatpickr-current-month'
        )[0];
        currentMonthHeader.replaceChild(
          yearSelectContainer,
          currentMonthHeader.getElementsByClassName('numInputWrapper')[0]
        );
      }
    };
  };
}

/**
 * Creates a <select> element with options of years ranging from minYear to maxYear
 * given in configuration.
 * @param minYear - minimum year for year range calculation.
 * @param maxYear - maximum year for year range calculation.
 */
function yearSelectElement(
  minYear?: number,
  maxYear?: number
): HTMLSelectElement {
  const yearSelect: HTMLSelectElement = document.createElement('select');
  yearSelect.classList.add('year-select');
  yearSelect.classList.add('cur-year');
  if (minYear && maxYear) {
    while (minYear <= maxYear) {
      const yearOption = document.createElement('option');
      yearOption.classList.add('flatpickr-year');
      yearOption.value = minYear.toString();
      yearOption.text = minYear.toString();
      yearSelect.appendChild(yearOption);
      minYear++;
    }
  }
  return yearSelect;
}

export default yearMonthSelection;
