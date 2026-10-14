<template>
  <div class="momarea-page">
    <b-card
      :header="$t('momarea.momarea.filtersTitle')"
      class="shadow-sm mb-3"
    >
      <b-row>
        <b-col
          lg="6"
          class="my-1"
        >
          <b-form-group
            v-slot="{ ariaDescribedby }"
            :label="$t('momarea.export.labelCompanyType')"
            label-for="type-of-company"
            label-cols-sm="3"
            label-align-sm="right"
            label-size="sm"
            class="mb-0"
          >
            <b-input-group size="sm">
              <b-form-select
                id="type-of-company"
                v-model="filter.type"
                :options="company_types"
                value-field="id"
                text-field="name"
                :aria-label="$t('momarea.export.labelCompanyType')"
              />
              <b-input-group-append>
                <b-button
                  variant="default"
                  @click="updateFilter()"
                >
                  <i
                    class="fa fa-search"
                    aria-hidden="true"
                  />
                  {{ $t('momarea.export.btnFilter') }}
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
            
        <b-col
          lg="6"
          class="my-1"
        >
          <b-form-group
            v-slot="{ ariaDescribedby }"
            :label="$t('momarea.export.labelFilterPSCL')"
            label-for="pscl"
            label-cols-sm="3"
            label-align-sm="right"
            label-size="sm"
            class="mb-0"
          >
            <b-form-select
              id="pscl"
              v-model="pscl"
              :options="pscl_options"
              value-field="id"
              text-field="name"
              :aria-label="$t('momarea.export.labelFilterPSCL')"
            />
          </b-form-group>
        </b-col>
        <b-col
          lg="6"
          class="my-1"
        >
          <b-form-group
            v-slot="{ ariaDescribedby }"
            :label="$t('momarea.export.labelSort')"
            label-for="sort-by-select"
            label-cols-sm="3"
            label-align-sm="right"
            label-size="sm"
            class="mb-0"
          >
            <b-input-group size="sm">
              <b-form-select
                id="sort-by-select"
                v-model="sortBy"
                :options="sortOptions"
                :aria-describedby="ariaDescribedby"
                class="w-75"
              >
                <template #first>
                  <option value="">
                    {{ $t('momarea.export.optionNone') }}
                  </option>
                </template>
              </b-form-select>

              <b-form-select
                id="sort-direction-select"
                v-model="sortDesc"
                :disabled="!sortBy"
                :aria-describedby="ariaDescribedby"
                :aria-label="$t('momarea.export.labelSort')"
                size="sm"
                class="w-25"
              >
                <option :value="false">
                  {{ $t('momarea.export.optionAscending') }}
                </option>
                <option :value="true">
                  {{ $t('momarea.export.optionDescending') }}
                </option>
              </b-form-select>
            </b-input-group>
          </b-form-group>
        </b-col>

        <b-col
          lg="6"
          class="my-1"
        >
          <b-form-group
            :label="$t('momarea.export.labelInitialSort')"
            label-for="initial-sort-select"
            label-cols-sm="3"
            label-align-sm="right"
            label-size="sm"
            class="mb-0"
          >
            <b-form-select
              id="initial-sort-select"
              v-model="sortDirection"
              :options="['asc', 'desc', 'last']"
              size="sm"
            />
          </b-form-group>
        </b-col>

        <b-col
          lg="6"
          class="my-1"
        >
          <b-form-group
            :label="$t('momarea.export.labelFilter')"
            label-for="filter-input"
            label-cols-sm="3"
            label-align-sm="right"
            label-size="sm"
            class="mb-0"
          >
            <b-input-group size="sm">
              <b-form-input
                id="filter-input"
                v-model="filterTable"
                type="search"
                :placeholder="$t('momarea.export.placeholderSearch')"
              />

              <b-input-group-append>
                <b-button
                  :disabled="!filterTable"
                  @click="filterTable = ''"
                >
                  {{ $t('momarea.export.btnClear') }}
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>

        <b-col
          lg="6"
          class="my-1"
        >
          <b-form-group
            v-slot="{ ariaDescribedby }"
            v-model="sortDirection"
            :label="$t('momarea.export.labelFilterBy')"
            :description="$t('momarea.export.descriptionFilterBy')"
            label-cols-sm="3"
            label-align-sm="right"
            label-size="sm"
            class="mb-0"
          >
            <b-form-checkbox-group
              v-model="filterOn"
              :aria-describedby="ariaDescribedby"
              class="mt-1"
            >
              <div class="checkbox-inline-container">
                <div
                  v-for="(field, index) in sortOptions"
                  :key="index"
                >
                  <b-form-checkbox
                    :value="field.value"
                    :aria-describedby="ariaDescribedby"
                    inline
                  >
                    {{ field.text }}
                  </b-form-checkbox>
                </div>
              </div>
            </b-form-checkbox-group>
          </b-form-group>
        </b-col>

        <b-col
          sm="5"
          md="6"
          class="my-1"
        >
          <b-form-group
            :label="$t('momarea.export.labelPerPage')"
            label-for="per-page-select"
            label-cols-sm="6"
            label-cols-md="4"
            label-cols-lg="3"
            label-align-sm="right"
            label-size="sm"
            class="mb-0"
          >
            <b-form-select
              id="per-page-select"
              v-model="perPage"
              :options="pageOptions"
              size="sm"
            />
          </b-form-group>
        </b-col>
      </b-row>
    </b-card>

    <b-card
      :header="$t('momarea.momarea.resultsTitle')"
      class="shadow-sm mb-3"
    >
      <!-- Compact results toolbar: column selector (left) + export (right) -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <b-dropdown
          variant="outline-primary"
          size="sm"
          :text="$t('momarea.export.selectColumns')"
        >
          <b-dropdown-form class="momarea-columns-menu">
            <b-form-checkbox
              :checked="allColumnsSelected"
              @change="toggleAllColumns"
            >
              {{ $t('momarea.export.toggleAll') }}
            </b-form-checkbox>
            <b-dropdown-divider />
            <b-form-checkbox
              v-for="(field, index) in fields"
              :key="index"
              v-model="checkboxStates[field.key]"
            >
              {{ field.label }}
            </b-form-checkbox>
          </b-dropdown-form>
        </b-dropdown>

        <b-button
          variant="primary"
          size="sm"
          @click="exportXls()"
        >
          <i
            class="fa fa-file-excel-o"
            aria-hidden="true"
          />
          {{ $t('momarea.export.btnExport') }}
        </b-button>
      </div>

      <hr>
      <b-table
        ref="table"
        v-model:sort-by="sortByModel"
        striped
        hover
        :items="selectedCompanies"
        :fields="selectedFields"
        :busy="loading"
        :v-model="tablevalues"
        responsive="md"
        :filter="filterTable"
        :filter-included-fields="filterOn"
        :sort-direction="sortDirection"
        stacked="md"
        show-empty
        small
        :tbody-tr-class="rowClass"
        @filtered="onFiltered"
      >
        <template #cell(name)="row">
          {{ row.item.name }}
        </template>
        <!-- count numbre of employees -->
        <template #cell(num_employees)="row">
          {{ row.item.name=="Totale"?row.item.num_employees:row.item.offices.reduce((a, b) => a + b.num_employees, 0) }}
        </template>
        <template #cell(moma_name)="row">
          <div
            v-for="(user, index) in row.item.users"
            :key="`moma-name-${user.id || user.username || index}`"
            class="d-block"
          >
            {{ user.first_name }} {{ user.last_name }}
          </div>
        </template>
        <template #cell(moma_email)="row">
          <div
            v-for="(user, index) in row.item.users"
            :key="`moma-email-${user.id || user.username || index}`"
            class="d-block"
          >
            {{ user.username }}
          </div>
        </template>
        <template #cell(offices)="row">
          <div
            v-for="(office, index) in row.item.offices"
            :key="`office-${office.id || office.name || index}`"
            class="d-block"
          >
            {{ office.name }}
          </div>
        </template>
        <template #cell(pscl)="row">
          <div
            v-for="(office, index) in row.item.offices"
            v-if="row.item.name!=='Totale'"
            :key="`pscl-${office.id || office.name || index}`"
            class="d-block"
          >
            <b-button
              variant="link"
              class="p-0"
              :aria-label="`PSCL ${office.name} — ${office.pscl.length > 0 ? $t('momarea.momarea.statusHasFiles') : $t('momarea.momarea.statusNoFiles')}`"
              :title="`PSCL ${office.name} — ${office.pscl.length > 0 ? $t('momarea.momarea.statusHasFiles') : $t('momarea.momarea.statusNoFiles')}`"
              :style="{ color: iconColor(office.pscl) }"
              @click="DownloadPscl(row.item.id,office.id,row.item.name,office.pscl[office.pscl.length - 1])"
            >
              <b-icon
                :icon="iconDownload(office.pscl)"
                aria-hidden="true"
              />
            </b-button>
          </div>
          <template v-if="row.item.name=='Totale'">
            <div class="d-block">
              <b-button
                variant="link"
                class="p-0"
                :aria-label="$t('momarea.psclist.titlePSCLZip')"
                :title="$t('momarea.psclist.titlePSCLZip')"
                @click="ZipPscl()"
              >
                <b-icon
                  icon="download"
                  aria-hidden="true"
                />
              </b-button>
            </div>
          </template>
        </template>
        <template #cell(psclName)="row">
          <div
            v-for="(office, index) in row.item.offices"
            v-if="row.item.name!=='Totale'"
            :key="`pscl-name-${office && (office.id || office.name) || index}`"
            class="d-block"
          >
            <span
              v-if="office!==null"
              class="d-block"
            >
              {{ office.pscl[office.pscl.length - 1] }}
            </span>
          </div>
        </template>
        <template #cell(survey)="row">
          <div
            v-for="(survey, index) in row.item.surveys"
            :key="`survey-${survey && (survey.id || survey.name) || index}`"
            class="d-block"
          >
            <span
              v-if="survey!==null"
              class="d-block"
            >
              {{ survey.name }}
            </span>
          </div>
        </template>
        <template #cell(surveyresults)="row">
          <div
            v-for="(survey, index) in row.item.surveys"
            v-if="row.item.name!=='Totale'"
            :key="`survey-results-${survey && (survey.id || survey.name) || index}`"
            class="d-block"
          >
            <div v-if="survey!==null">
              <b-button
                variant="link"
                class="p-0"
                :aria-label="`${$t('momarea.export.fieldSurveyResults')} ${survey.name}`"
                :title="`${$t('momarea.export.fieldSurveyResults')} ${survey.name}`"
                @click="exportSurveyData(survey.id,survey.name)"
              >
                <b-icon
                  icon="download"
                  aria-hidden="true"
                />
              </b-button>
            </div>
          </div>
          <template v-if="row.item.name=='Totale'">
            <div class="d-block">
              <b-button
                variant="link"
                class="p-0"
                :aria-label="$t('momarea.export.fieldSurveyResults')"
                :title="$t('momarea.export.fieldSurveyResults')"
                @click="Export()"
              >
                <b-icon
                  icon="download"
                  aria-hidden="true"
                />
              </b-button>
            </div>
          </template>
        </template>
        <template #cell(impatti)="row">
          <div
            v-for="(survey, index) in row.item.surveys"
            :key="`impatti-${survey && (survey.id || survey.name) || index}`"
            class="d-block"
          >
            <div v-if="row.item.offices[0] !== undefined && row.item.offices[0].pscl && row.item.offices[0].pscl.length > 0">
              <b-button
                variant="link"
                class="p-0"
                :aria-label="`${$t('momarea.export.fieldImpacts')} ${row.item.offices[0].name}`"
                :title="`${$t('momarea.export.fieldImpacts')} ${row.item.offices[0].name}`"
                @click="generatePSCLXlsx(row.item.id, row.item.offices[0].id, survey.id, row.item.name, row.item.offices[0].name)"
              >
                <b-icon
                  icon="download"
                  aria-hidden="true"
                />
              </b-button>
            </div>
          </div>
        </template>
        <template #cell(offices_num)="row">
          {{ row.item.name=="Totale"?row.item.offices_num:row.item.offices.length }}
        </template>
        <template #table-busy>
          <div class="text-center text-danger my-2">
            <b-spinner class="align-middle" />
            <strong>{{ $t('momarea.export.loading') }}</strong>
          </div>
        </template>
      </b-table>

      <div class="d-flex justify-content-center mt-3">
        <b-pagination
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          :aria-label="$t('momarea.export.labelPerPage')"
          align="fill"
          size="sm"
          class="my-0"
        />
      </div>
    </b-card>

    <div>
      <div>
        <!-- Modal for selecting export options -->
        <b-modal
          v-model="showModalExport"
          :title="$t('momarea.export.modalTitleExportOptions')"
          hide-footer
        >
          <!-- Buttons Export all or select surveys and questions -->
          <b-row>
            <b-col>
              <b-button
                variant="primary"
                @click="AllExportSurveyData('Tutti')"
              >
                {{ $t('momarea.export.btnExportAll') }}
              </b-button>
            </b-col>
            <b-col>
              <b-button
                variant="primary"
                @click="showModalForExport()"
              >
                {{ $t('momarea.export.btnExportSelection') }}
              </b-button>
            </b-col>
          </b-row>
        </b-modal>
      </div>
    </div>

    <div>
      <div>
        <!-- Modal for selecting surveys and questions -->
        <b-modal
          v-model="showModalSurveys"
          :title="$t('momarea.export.modalTitleExportResults')"
          hide-footer
        >
          <!-- Survey selection -->
          <label for="surveySelect">{{ $t('momarea.export.labelChooseSurveys') }}</label>
          <b-form-select
            id="surveySelect"
            v-model="selectedSurvey"
            multiple
          >
            <option
              v-for="survey in surveys"
              :key="survey.id"
              :value="survey.id"
            >
              {{ survey.name }}
            </option>
          </b-form-select>

          <!-- next button open modalquestions and close showModalSurveys -->
          <b-button
            variant="primary"
            @click="showModalForQuestions()"
          >
            {{ $t('momarea.export.btnNext') }}
          </b-button>
        </b-modal>
      </div>
    </div>

    <div>
      <div>
        <!-- Modal for selecting surveys and questions -->
        <b-modal
          v-model="showModalQuestions"
          :title="$t('momarea.export.modalTitleExportResults')"
          hide-footer
        >
          <!-- busy until get questions -->
          <b-spinner
            v-if="questions.length===0"
            :label="$t('momarea.export.loading')"
          />

          <!-- Question selection -->
          <div v-if="questions.length!=0">
            <label for="questionSelect">{{ $t('momarea.export.labelChooseQuestions') }}</label>
            <b-form-select
              id="questionSelect"
              v-model="selectedQuestions"
              multiple
            >
              <option
                v-for="question in questions"
                :key="question.id"
                :value="question.id"
              >
                {{ question.text }}
              </option>
            </b-form-select>

            <!-- Export button -->
            <b-button
              variant="primary"
              @click="AllExportSurveyData('Tutti',0)"
            >
              {{ $t('momarea.export.btnExport') }}
            </b-button>
          </div>
        </b-modal>
      </div>
    </div>
  </div>
</template>

<script>
import UserService from "@/services/user.service";
import AreaService from "../area.service";
import Util from "@/mixing/util";
import bTableSort from "@/mixing/bTableSort";
import mime from "mime-types";
import * as XLSX from "xlsx";
import { toast } from "@/services/notification.service";

export default {
    name: "MomareaExport",
    mixins: [Util, bTableSort],
    data() {
        return {
            companies: [],
            fields: [
                // { key: 'id', label: 'ID' },
                {
                    key: 'name',
                    label: this.$t('momarea.export.fieldName'),
                    sortable: true

                },
                //add moma Area name and moma Area email
                {
                    key: 'moma_name',
                    label: this.$t('momarea.export.fieldMomaName'),
                    sortable: false
                },
                {
                    key: 'moma_email',
                    label: this.$t('momarea.export.fieldMomaEmail'),
                    sortable: false
                },
                {
                    key: 'num_employees',
                    label: this.$t('momarea.export.fieldNumEmployees'),
                    sortable: true
                },
                {
                    key: 'offices_num',
                    label: this.$t('momarea.export.fieldOfficesNum'),
                    sortable: true
                },
                {
                    key: 'offices',
                    label: this.$t('momarea.export.fieldOffices'),
                    sortable: false
                },
                {
                    key: 'pscl',
                    label: this.$t('momarea.export.fieldPSCL')
                },
                {
                    key: 'psclName',
                    label: this.$t('momarea.export.fieldPSCLName'),
                    sortable: false
                },
                {
                    key: 'survey',
                    label: this.$t('momarea.export.fieldSurvey'),
                    sortable: false
                },
                {
                    key: 'surveyresults',
                    label: this.$t('momarea.export.fieldSurveyResults')
                },
                {
                    key: 'impatti',
                    label: this.$t('momarea.export.fieldImpacts')
                },
            ],
            filter: {
                type: null,
                name: null,
            },
            company_types: [],
            loading: false,
            busy: false,
            busyXlsx: false,
            tablevalues: [],
            showModalExport: false,
            showModalSurveys: false,
            showModalQuestions: false,
            selectedSurvey: null,
            selectedQuestions: [],
            surveys: [], // Add your survey data here
            questions: [], // Add your question data here
            statsIntervalId: null,
            checkboxStates: {},
            // selectedCompanies: [],
            pscl_options: [
                {
                    id: 1,
                    name: this.$t('momarea.export.psclOptionNoPscl')
                },
                {
                    id: 2,
                    name: this.$t('momarea.export.psclOptionYesPscl')
                },
                {
                    id: 3,
                    name: this.$t('momarea.export.psclOptionAll')
                },
                {
                    id: 4,
                    name: this.$t('momarea.export.psclOptionPscl2024')
                },
                {
                    id: 5,
                    name: this.$t('momarea.export.psclOptionNoPscl2024')
                },
            ],
            pscl: 3, 
            currentPage: 1,
            perPage: 10,
            pageOptions: [10, 25, 50],
            pagination: {
                total: 0,
                page: 1,
                limit: 10,
                pageCount: 1,
            },
            sortBy: '',
            sortDesc: false,
            sortDirection: 'asc',
            filterTable: null,
            filterOn: [], 
            filtersize: 0,
            };
    },
    computed: {
        selectedFields() {
        // Filter fields based on checkbox states
        return this.fields.filter(field => this.checkboxStates[field.key]);

        },
        allColumnsSelected() {
            return this.fields.every(field => this.checkboxStates[field.key]);
        },
        selectedCompanies() {
            // The "Totale" summary row (offices: []) must survive every PSCL filter so
            // it stays visible as the pinned last row on all pages.
            const keepTotal = company => company.name === 'Totale';
            if(this.pscl==1){
                return this.companies.filter(company =>
                    keepTotal(company) ||
                    // Check if company.offices is an array before calling .every()
                    (Array.isArray(company.offices) && company.offices.length != 0 && company.offices.every(office => office.pscl.length == 0))
                );
            }else if(this.pscl==2){
                return this.companies.filter(company =>
                    keepTotal(company) ||
                    // Check if company.offices is an array before calling .every()
                    (Array.isArray(company.offices) && company.offices.length != 0 && company.offices.some(office => office.pscl.length >0))
                );

            }else if(this.pscl==3){
                return this.companies;
            }else if(this.pscl==4){
                return this.companies.filter(company =>
                    keepTotal(company) ||
                    // Check if company.offices is an array before calling .every()
                    (Array.isArray(company.offices) && company.offices.length != 0 && company.offices.some(office => office.pscl.length >0 && office.pscl[office.pscl.length - 1].includes("2024")))
                );
            }else if(this.pscl==5){
                return this.companies.filter(company =>
                    keepTotal(company) ||
                    // Check if company.offices is an array before calling .every()
                    (Array.isArray(company.offices) && company.offices.length != 0 && company.offices.every(office => office.pscl.length >0 && !office.pscl[office.pscl.length - 1].includes("2024")))
                );
            }

            return [];
        },
        sortOptions() {
            // Create an options list from our fields
            return this.selectedFields
            .filter(f => f.sortable)
            .map(f => {
                return { text: f.label, value: f.key }
            })
        },
        totalRows() {
            if (this.filterTable || this.pscl !== 3) {
                return this.filtersize || this.selectedCompanies.length;
            }

            return this.pagination.total || this.selectedCompanies.length;
        },

    },
    watch: {
        async currentPage(newPage, oldPage) {
            if (newPage !== oldPage) {
                await this.loadCompanies(newPage);
            }
        },
        async perPage(newValue, oldValue) {
            if (newValue !== oldValue) {
                if (this.currentPage !== 1) {
                    this.currentPage = 1;
                    return;
                }
                await this.loadCompanies(1);
            }
        },
    },
    async created() {
        this.getYear();
        let res = await UserService.getCompanyTypes();
        this.company_types = res.data.company_types;
        this.company_types.unshift(
			{
					id: null,
					name: "Tutte",
				});
        this.filter.type = this.company_types[0].id;
        // Start with a compact subset visible; the rest are opt-in via the
        // "Colonne attive" dropdown.
        const defaultVisibleColumns = ['name', 'moma_name', 'moma_email', 'offices', 'pscl'];
        this.fields.forEach(field => {
            this.checkboxStates[field.key] = defaultVisibleColumns.includes(field.key);
        });
        await this.loadCompanies(1);
    },
    // mounted() {
    //   // Set the initial number of items
    //   this.totalRows = this.items.length
    // },
    methods: {
        sleep(milliseconds) {
            return new Promise((resolve) => setTimeout(resolve, milliseconds));
        },
        async DownloadPscl(company_id, office_id, companyName, fname=null) {
            // let files = (await UserService.listPSCL(company_id, office_id)).data.files;
            if (fname!=null) {
                // let fname = files[files.length - 1];
                console.log(fname);
                try {
                    this.busy = true;
                    const res = await UserService.downloadPSCL(company_id, office_id, fname, this.year);
                    let ext = mime.extension(res.data.type);
                    if (ext === "json") {
                        toast(this.$t('momarea.export.toastNoUploads'), {
                            title: this.$t('momarea.export.titleNoUploads'),
                            variant: "warning",
                            autoHideDelay: 2000,
                            appendToast: true,
                        });
                        return;
                    }
                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", `${fname}-${companyName}.${ext}`);
                    document.body.appendChild(link);
                    link.click();
                } catch (e) {
                    console.log(e);
                } finally {
                    this.busy = false;
                }
            } else {
                toast(this.$t('momarea.export.toastNoUploads'), {
                    title: this.$t('momarea.export.titleNoUploads'),
                    variant: "warning",
                    autoHideDelay: 2000,
                    appendToast: true,
                });
            }
            // await AreaService.downloadPscl(company_id, office_id);
        },
        async exportSurveyData(survey_id, survey_name) {
            try {
                this.busy = true;
                toast(this.$t('momarea.export.toastExportInProgress'), {
                    title: this.$t('momarea.export.titleExport'),
                    variant: "info",
                    autoHideDelay: 2000,
                    appendToast: true,
                });
                let res = await UserService.exportSurveyData(survey_id);
                toast(res.data.message, {
						title: "No Uploads",
						variant: "warning",
						autoHideDelay: 2000,
						appendToast: true,
					});
				this.statsIntervalId = setInterval(async () => {
					try {
						this.getStatusExport(survey_id, survey_name);
					} catch (e) {                
						console.log(e);
					}
				}, 10000);
                // let ext = mime.extension(res.data.type);
                // console.log(res);
                // // if (ext === "json") {
                // //     toast("Error in questionnaire export", {
                // //         title: "No Uploads",
                // //         variant: "warning",
                // //         autoHideDelay: 2000,
                // //         appendToast: true,
                // //     });
                // //     this.busy = false;
                // //     return;
                // // }
                // // const url = window.URL.createObjectURL(new Blob([res.data]));
                // // const link = document.createElement("a");
                // // link.href = url;
                // // link.setAttribute("download", `${survey_name}.${ext}`);
                // // document.body.appendChild(link);
                // // link.click();
            } catch (error) {
                console.log(error);
            } finally {
                this.busy = false;
            }
        },
        async generatePSCLXlsx(companyId, officeId, surveyId, companyName, officeName) {
            try {
                this.busyXlsx = true;
                // Service path is /generate-xlsx/{companyId}/{officeId}/{surveyId}/{year}.xlsx —
                // all four are required (previously only office/survey were sent, in the wrong
                // slots, producing .../undefined/undefined.xlsx).
                const res = await UserService.generatePSCLXlsx(companyId, officeId, surveyId, this.year);
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement("a");
                link.href = url;

                link.setAttribute("download", `pscl-${companyName.replace(" ", "_")}-${officeName.replace(" ", "_")}.xls`);
                document.body.appendChild(link);
                link.click();
            } catch (e) {
                toast(String(e), {
                    title: this.$t('momarea.export.titleError'),
                    variant: "danger",
                    autoHideDelay: 2000,
                    appendToast: true,
                });
                console.log(e);
            } finally {
                this.busyXlsx = false;
            }
        },
        toggleAllColumns(checked) {
            this.fields.forEach(field => {
                this.checkboxStates[field.key] = checked;
            });
        },
        rowClass(item, type) {
            if (type === 'row' && item && item.name === 'Totale') {
                return 'momarea-total-row';
            }

            return '';
        },
        buildSummaryRow(companies) {
            return {
                id: 0,
                name: "Totale",
                moma_name: "",
                offices: [],
                num_employees: companies.reduce((total, company) => {
                    return total + company.offices.reduce((officeTotal, office) => officeTotal + (office.num_employees != null ? office.num_employees : 0), 0);
                }, 0),
                offices_num: companies.reduce((acc, company) => {
                    return acc + company.offices.length;
                }, 0),
            };
        },
        async loadCompanies(page = 1) {
            try {
                this.loading = true;
                const res = await AreaService.getExportList({
                    year: this.year,
                    type: this.filter.type,
                    q: this.filter.name,
                    page,
                    limit: this.perPage,
                });
                const companies = Array.isArray(res.data.companies) ? res.data.companies : [];
                this.pagination = res.data.pagination || {
                    total: companies.length,
                    page,
                    limit: this.perPage,
                    pageCount: 1,
                };
                this.companies = companies.length > 0 ? [...companies, this.buildSummaryRow(companies)] : [];
                this.filtersize = this.companies.length;
            } catch (error) {
                console.log(error);
                this.companies = [];
                this.pagination = {
                    total: 0,
                    page: 1,
                    limit: this.perPage,
                    pageCount: 1,
                };
                this.filtersize = 0;
            } finally {
                this.loading = false;
            }
        },
        async updateFilter() {
            this.currentPage = 1;
            await this.loadCompanies(1);
            localStorage.setItem("filter_company_name", this.filter.name);
            localStorage.setItem("filter_company_type", this.filter.type);
        },
        exportXls() {
            try {
                // Get table rows
                const rows = this.$refs.table.$el.querySelectorAll('tr');
                console.log("rows",rows);
                // Define columns to omit
                const omitColumns = ['PSCL', 'Risultati Questionario', 'Foglio Impatti'];

                // Map rows to data
                const data = Array.from(rows).map(row => {
                    const cells = Array.from(row.querySelectorAll('td'));

                    if (cells.length === 0) {
                        return null; // or you can return an empty object, depending on your preference
                    }

                    return this.fields
                        .map((field, index) => ({
                            index,
                            label: field.label
                        }))
                        .filter(field => !omitColumns.includes(field.label))
                        .map(field => cells[field.index] ? cells[field.index].innerText : '');
                });

                // Add headers
                const headers = this.fields
                    .map(field => field.label)
                    .filter(label => !omitColumns.includes(label));
                data.unshift(headers);
                console.log(data);
                // cleand array from null values
                let dataclean = data.filter((el) => {
                    return el != null;
                });
                console.log("clean",dataclean);
                // Create a workbook
                let wb = XLSX.utils.book_new();
                wb.Props = {
                    Title: "Esportazione Excel",
                    Subject: "Esportazione",
                    Author: "--",
                    CreatedDate: new Date(),
                };
                wb.SheetNames.push("moma area table");
                // Convert data to worksheet
                const ws = XLSX.utils.json_to_sheet(dataclean);
                wb.Sheets["moma area table"] = ws;
                XLSX.writeFile(wb, "indicatore.xlsx");
            } catch (err) {
                console.error(err);
            }
        },
        // create a function to return the icon name based files.length
        iconDownload(files) {
            // console.log(files);
            if (files.length > 0) {
                return "download";
            } else {
                return "x-circle";
            }
        },
        iconColor(files) {
            // AA-compliant success/danger (≥4.5:1 on white); the icon shape
            // (download vs x-circle) carries the same meaning without relying on
            // color. Named "green"/"red" failed WCAG 1.4.3 contrast.
            if (files.length > 0) {
                return "#198253";
            } else {
                return "#b33c12";
            }
        },
        async ZipPscl() {
            // take only companies id and offices id from this.companies object
            let companies = this.companies.map((company) => {
                if(company.name!=="Totale"){
                    return {
                            id: company.id,
                            offices: company.offices.map((office) => {
                                return office.id;
                            }),
                    };
                }
            });
            console.log("filtercompanies", companies);
            await UserService.downloadPSCLZip(companies, this.year);

        },
        // export all survey answers using an array of survey ids obtained from the companies object
        async AllExportSurveyData(survey_name, all = true) {
            
            
            try {
                this.busy = true;
                
                let res;
                let exportData={surveys:this.selectedSurvey,questions:this.selectedQuestions};
                if (all) {
                    this.showModalExport = false;
                    this.selectedSurvey = this.surveys.map((survey) => survey.id);
                    res = await UserService.exportSurveyData(null,all,all,exportData);
                    
                }else{
                    
                    // alert if not questions are selected
                    if (this.selectedQuestions.length === 0) {
                        toast(this.$t('momarea.export.toastSelectQuestion'), {
                            title: this.$t('momarea.export.titleError'),
                            variant: "danger",
                            autoHideDelay: 2000,
                            appendToast: true,
                        });
                        return;
                    }else{
                        // alert the export is in progress
                        toast(this.$t('momarea.export.toastExportInProgress'), {
                            title: this.$t('momarea.export.titleExport'),
                            variant: "info",
                            autoHideDelay: 2000,
                            appendToast: true,
                        });
                    }
                    this.showModalQuestions = false;
                    res = await UserService.exportSurveyData(null,all,all,exportData);
                }
                toast(res.data.message, {
						title: "No Uploads",
						variant: "warning",
						autoHideDelay: 2000,
						appendToast: true,
					});
				this.statsIntervalId = setInterval(async () => {
					try {
						this.getStatusExport(null, survey_name);
					} catch (e) {                
						console.log(e);
					}
				}, 10000);
                
                // let ext = mime.extension(res.data.type);
                
                // if (ext === "json") {
                //     toast("Error in survey export", {
                //         title: "No Uploads",
                //         variant: "warning",
                //         autoHideDelay: 2000,
                //         appendToast: true,
                //     });
                //     this.busy = false;
                //     return;
                // }
                // const url = window.URL.createObjectURL(new Blob([res.data]));
                // const link = document.createElement("a");
                // link.href = url;
                // link.setAttribute("download", `${survey_name}.${ext}`);
                // document.body.appendChild(link);
                // link.click();
            } catch (error) {
                console.log(error);
                toast(this.$t('momarea.export.toastExportError'), {
                    title: this.$t('momarea.export.titleError'),
                    variant: "danger",
                    autoHideDelay: 2000,
                    appendToast: true,
                });
            } finally {
                this.busy = false;
            }
        },
        // show modal for selecting survey and questions
        Export() {
            this.showModalExport = true;
            this.surveys=[];
            this.companies.forEach((company) => {
                    if(company.name!=="Totale"){
                        company.surveys.forEach((survey) => {
                            if (survey !== null) {
                                this.surveys.push({ id: survey.id, name: survey.name });
                            }
                        });
                    }
                });
            // select the first survey
            this.selectedSurvey = this.surveys.map((survey) => survey.id);
        },
        showModalForExport() {
            this.showModalExport = false;
            this.showModalSurveys = true;
           
        },
        async showModalForQuestions() {
            // alert if no survey is selected
            if (this.selectedSurvey === null) {
                toast(this.$t('momarea.export.toastSelectSurvey'), {
                    title: this.$t('momarea.export.titleError'),
                    variant: "danger",
                    autoHideDelay: 2000,
                    appendToast: true,
                });
                return;
            }
            this.showModalSurveys = false;
            this.showModalQuestions = true;
            const res = await AreaService.getExportQuestions(null,this.selectedSurvey);
            console.log("res", res);
            // if res.data.questions is empty alert no questions found
            if (res.data.questions.length === 0) {
                toast(this.$t('momarea.export.toastNoQuestionsFound'), {
                    title: this.$t('momarea.export.titleNoQuestions'),
                    variant: "warning",
                    autoHideDelay: 2000,
                    appendToast: true,
                });
                this.showModalSurveys = true;
                this.showModalQuestions = false;
                return;
            }
            // get questions from res.data.questions and add them to this.questions where res.data.questions is an array of questions objects with id and name
            this.questions = res.data.questions.map((question) => {
                return { id: question.question.id, text: `${question.question.id} - ${question.question.description}` };
            });
            // this.selectedSurvey.forEach((survey) => {
            //     this.questions.push({ id: survey, text: "Tutte le domande" });
            // });
        },
        async getStatusExport(survey_id, survey_name) {
            try {
                let res = await UserService.getStatusExport(survey_id);
                if (res.data == null){
                    this.lock = [false, false, false, false, false];
                    this.message = this.$t('momarea.export.messageChooseOperation');
                    return;
                }
				console.log("res from getStatusExport",res);
                let ext = mime.extension(res.data.type);
				console.log("ext",ext);
				if(ext === "json") {
					let message = res.data.message;
					let lock = res.data.lock;
					toast(this.$t('momarea.export.toastInProgress'), {
							title: this.$t('momarea.export.titleNoUploads'),
							variant: "warning",
							autoHideDelay: 2000,
							appendToast: true,
						});
						this.busy = false;
						return;
					
				}else{		
					
					// alert of the download
					toast(this.$t('momarea.export.toastExportCompleted'), {
						title: this.$t('momarea.export.titleExport'),
						variant: "success",
						autoHideDelay: 2000,
						appendToast: true,
					});
					const url = window.URL.createObjectURL(new Blob([res.data]));
					const link = document.createElement("a");
					link.href = url;
					link.setAttribute("download", `${survey_name}.${ext}`);
					document.body.appendChild(link);
					link.click();
					if (this.statsIntervalId) {
						clearInterval(this.statsIntervalId);
					}
				}

            } catch (error) {
                toast(error.message, {
                    title: this.$t('momarea.export.titleNoUploads'),
                    variant: "warning",
                    autoHideDelay: 2000,
                    appendToast: true,
                });
            }
        },
        onFiltered(filteredItems) {
        this.filtersize = filteredItems.length;
      }
        

    },
};
</script>
<style>
/* Checkbox groups wrap onto multiple lines instead of overflowing on small screens. */
.checkbox-inline-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
}

/* Shared Paper Dashboard SCSS strips focus outlines app-wide; restore a visible
   focus indicator scoped to this module (WCAG 2.4.7). */
.momarea-page :focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Pin the "Totale" summary row to the bottom of the table so it stays visible
   while scrolling. Opaque background prevents rows showing through. */
.momarea-page .momarea-total-row > td {
  position: sticky;
  bottom: 0;
  background: #fff;
  font-weight: 600;
  box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.15);
  z-index: 1;
}

/* Keep export controls/text above AA contrast on the panel background. */
.momarea-page .text-muted,
.momarea-page small,
.momarea-page .small,
.momarea-page .page-link,
.momarea-page .btn-link,
.momarea-page .custom-select,
.momarea-page .form-control,
.momarea-page .table th,
.momarea-page .table td,
.momarea-page .table caption {
  color: #495057 !important;
}

.momarea-page .btn:disabled,
.momarea-page .btn.disabled,
.momarea-page .page-item.disabled .page-link,
.momarea-page .custom-select:disabled,
.momarea-page [aria-disabled="true"] {
  color: #495057 !important;
  opacity: 1 !important;
}
</style>