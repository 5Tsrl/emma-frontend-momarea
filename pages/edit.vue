<template>
  <div class="momarea-page">
    <b-overlay
      :show="loading"
      rounded="sm"
    >
      <b-card class="shadow-sm mb-3">
        <template #header>
          <h2 class="h5 mb-0">
            {{ $t('momarea.edit.formCardTitle') }}
          </h2>
        </template>
        <b-form>
          <b-form-row>
            <b-col sm="6">
              <b-form-group
                :label="$t('momarea.momarea.labelArea')"
                label-for="momarea-area-name"
              >
                <b-form-input
                  id="momarea-area-name"
                  v-model="area.name"
                  :placeholder="$t('momarea.edit.insert_area_name')"
                  required
                  aria-required="true"
                />
              </b-form-group>
            </b-col>
            <b-col sm="6">
              <b-form-group
                :label="$t('momarea.momarea.labelUsers')"
                label-for="momarea-area-users"
                :aria-label="$t('momarea.momarea.labelUsers')"
              >
                <b-form-checkbox-group
                  id="momarea-area-users"
                  v-model="selectedUsers"
                  class="checkbox-inline-wrap"
                  :options="users"
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
            {{ $t('momarea.edit.areaTypeGroup') }}
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
            {{ $t('momarea.edit.Province') }}
            <span
              v-if="selectedArea === 'province'"
              class="sr-only"
            >{{ $t('momarea.add.stateSelected') }}</span>
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
            {{ $t('momarea.edit.City') }}
            <span
              v-if="selectedArea === 'city'"
              class="sr-only"
            >{{ $t('momarea.add.stateSelected') }}</span>
          </b-button>
          <b-button
            :variant="selectedArea === 'polygon' ? 'primary' : 'outline-primary'"
            :aria-pressed="(selectedArea === 'polygon').toString()"
            @click="changeArea('polygon')"
          >
            <b-icon
              v-if="selectedArea === 'polygon'"
              icon="check"
              aria-hidden="true"
              class="me-1"
            />
            {{ $t('momarea.edit.Perimeter') }}
            <span
              v-if="selectedArea === 'polygon'"
              class="sr-only"
            >{{ $t('momarea.add.stateSelected') }}</span>
          </b-button>
        </b-button-group>

        <b-alert
          v-if="selectedArea === 'polygon'"
          show
          variant="info"
          class="mt-3 mb-0 d-flex align-items-center justify-content-end mb-2"
        >
          <span>{{ $t('momarea.edit.draw_perimeter') }}</span>
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
          {{ $t('momarea.edit.chooseAreaTypePrompt') }}
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
          {{ $t('momarea.edit.save_area') }}
        </b-button>
      </div>
    </b-overlay>
  </div>
</template>

<script>
import Util from "@/mixing/util";
import PolygonEdit from "../components/PolygonEdit.vue";
import AreaService, { usersMapToOptions } from "../area.service.js";
import { toast } from "@/services/notification.service";

export default {
  name: "MomareaEdit",
  components: {
    PolygonEdit,
  },
  mixins: [Util],
  data() {
    return {
      area: {
        province: null,
        city: null,
        polygon: null,
        users: [{ id: null }],
      },
      users: null,
      id: null,
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
      this.id = parseInt(this.$route.params.id);
      let res = (await AreaService.editArea(this.id, null)).data;
      this.area = res.area;
      if (this.area.polygon !== null) {
        this.selectedArea = "polygon";
      } else if (this.area.city !== null) {
        this.selectedArea = "city";
      } else if (this.area.province !== null) {
        this.selectedArea = "province";
      }
      this.users = usersMapToOptions(res.users);
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
        await AreaService.editArea(this.id, this.area);
        await this.$router.push({ path: "/momarea" });
        toast(this.$t('momarea.edit.saveSuccess'), {
          title: this.$t('momarea.momarea.titleEditArea'),
          variant: "success",
        });
      } catch (e) {
        toast(this.$t('momarea.edit.saveError'), {
          title: this.$t('momarea.export.titleError'),
          variant: "danger",
        });
      } finally {
        this.loading = false;
      }
    },
    changeArea(areaType) {
      this.selectedArea = areaType;
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
  gap: 0.5rem 1rem;
  /* riga colonna */
}
</style>
