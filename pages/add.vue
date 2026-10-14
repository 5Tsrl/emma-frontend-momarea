<template>
  <div class="momarea-page">
    <b-overlay
      :show="loading"
      rounded="sm"
    >
      <b-card class="shadow-sm mb-3">
        <template #header>
          <h2 class="h5 mb-0">
            {{ $t('momarea.add.formCardTitle') }}
          </h2>
        </template>
        <CampiObbligatori />
        <b-form>
          <b-form-row>
            <b-col sm="6">
              <b-form-group
                :label="$t('momarea.momarea.labelArea') + ' *'"
                label-for="momarea-area-name"
              >
                <b-form-input
                  id="momarea-area-name"
                  v-model="area.name"
                  :placeholder="$t('momarea.add.insert_area_name')"
                  required
                  aria-required="true"
                />
              </b-form-group>
            </b-col>
            <b-col sm="6">
              <b-form-group
                :label="$t('momarea.momarea.labelUsers') + ' *'"
                label-for="momarea-area-users"
                :aria-label="$t('momarea.momarea.labelUsers')"
              >
                <b-form-checkbox-group
                  id="momarea-area-users"
                  v-model="selectedUsers"
                  :options="users"
                  class="checkbox-inline-wrap"
                  required
                  aria-required="true"
                  multiple
                />
              </b-form-group>
            </b-col>
          </b-form-row>
        </b-form>
      </b-card>

      <b-card class="shadow-sm mb-3">
        <template #header>
          <h2
            id="momarea-area-type-label"
            class="h5 mb-0"
          >
            {{ $t('momarea.add.areaTypeGroup') + ' *' }}
          </h2>
        </template>

        <b-button-group
          class="flex-wrap"
          aria-labelledby="momarea-area-type-label"
        >
          <b-button
            :variant="selectedArea === 'province' ? 'primary' : 'outline-primary'"
            :aria-pressed="(selectedArea === 'province').toString()"
            @click="changeArea('province')"
          >
            <b-icon
              v-if="selectedArea === 'province'"
              icon="check"
              aria-hidden="true"
              class="me-1"
            />
            <span
              v-if="selectedArea === 'province'"
              class="sr-only"
            >{{ $t('momarea.add.stateSelected') }}</span>
            {{ $t('momarea.add.Province') }}
          </b-button>
          <b-button
            :variant="selectedArea === 'city' ? 'primary' : 'outline-primary'"
            :aria-pressed="(selectedArea === 'city').toString()"
            @click="changeArea('city')"
          >
            <b-icon
              v-if="selectedArea === 'city'"
              icon="check"
              aria-hidden="true"
              class="me-1"
            />
            <span
              v-if="selectedArea === 'city'"
              class="sr-only"
            >{{ $t('momarea.add.stateSelected') }}</span>
            {{ $t('momarea.add.City') }}
          </b-button>
          <b-button
            :variant="selectedArea === 'polygon' ? 'primary' : 'outline-primary'"
            :aria-pressed="(selectedArea === 'polygon').toString()"
            @click="changeArea('polygon')"
          >
            <span
              v-if="selectedArea === 'polygon'"
              class="sr-only"
            >{{ $t('momarea.add.stateSelected') }}</span>
            {{ $t('momarea.add.Perimeter') }}
            <b-icon
              v-if="selectedArea === 'polygon'"
              icon="check"
              aria-hidden="true"
              class="me-1"
            />
          </b-button>
        </b-button-group>

        <b-alert
          v-if="selectedArea === 'polygon'"
          show
          variant="info"
          class="mt-3 mb-0 d-flex align-items-center justify-content-end mb-2"
        >
          <span>{{ $t('momarea.add.draw_perimeter') }}</span>
          <b-icon
            icon="arrow-down-circle-fill"
            aria-hidden="true"
            class="ms-2"
          />
        </b-alert>

        <p
          v-if="!selectedArea"
          class="text-muted mt-3 mb-0"
        >
          {{ $t('momarea.add.chooseAreaTypePrompt') }}
        </p>

        <polygon-edit
          v-if="selectedArea"
          :class="selectedArea === 'polygon' ? 'mt-0' : 'mt-3'"
          :area="area"
          :selected-area="selectedArea"
        />
      </b-card>

      <div class="d-flex justify-content-end mb-3">
        <b-button
          id="momarea-save-button"
          variant="success"
          @click="onSubmit()"
        >
          <b-icon
            icon="check2"
            aria-hidden="true"
            class="me-1"
          />
          {{ $t('momarea.add.save_area') }}
        </b-button>
      </div>
    </b-overlay>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import Util from "@/mixing/util";
import PolygonEdit from "../components/PolygonEdit.vue";
import AreaService, { usersMapToOptions } from "../area.service";
import { toast } from "@/services/notification.service";

export default {
  name: "MomareaAdd",
  components: {
    PolygonEdit,
    CampiObbligatori: defineAsyncComponent(() => import("@/components/CampiObbligatori.vue")),
  },
  mixins: [Util],
  data() {
    return {
      area: {
        name: null,
        province: null,
        city: null,
        polygon: null,
        users: [{ id: null }],
      },
      users: null,
      loading: false,
      selectedArea: null,
    };
  },
  computed: {
    selectedUsers: {
      get() {
        if (this.area.users == null) {
          return [];
        }
        if (Array.isArray(this.area.users)) {
          return this.area.users.map(user => String(user.id));
        }
        return this.area.users._ids;
      },
      set(value) {
        this.area.users = { _ids: value };
      },
    },
  },
  async created() {
    this.loading = true;
    try {
      var data = (await AreaService.addArea(null)).data;
      this.users = usersMapToOptions(data.users);
    } catch (e) {
      toast(this.$t('momarea.momarea.loadError'), {
        title: this.$t('momarea.export.titleError'),
        variant: "danger",
      });
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async onSubmit() {
      this.loading = true;
      try {
        await AreaService.addArea(this.area);
        await this.$router.push({ path: "/momarea" });
        toast(this.$t('momarea.add.saveSuccess'), {
          title: this.$t('momarea.momarea.titleAddArea'),
          variant: "success",
        });
      } catch (e) {
        toast(this.$t('momarea.add.saveError'), {
          title: this.$t('momarea.export.titleError'),
          variant: "danger",
        });
      } finally {
        this.loading = false;
      }
    },
    changeArea(value) {
      this.selectedArea = value;
    },
  },
};
</script>

<style scoped>
/* Shared Paper Dashboard SCSS strips focus outlines app-wide; restore a visible
   focus indicator scoped to this module (WCAG 2.4.7). ::v-deep so it also covers
   the embedded map editor's controls. */
.momarea-page ::v-deep :focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.checkbox-inline-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.6rem;
  /* riga colonna */
}
</style>
