<template>
  <div class="momarea-page">
    <div class="mb-3">
      <b-form @submit.prevent="filterarea">
        <div class="d-flex flex-nowrap align-items-end gap-2">
          <b-form-group
            :label="$t('momarea.momarea.labelArea')"
            label-for="momarea-filter-name"
            class="flex-grow-1 mb-0"
          >
            <b-form-input
              id="momarea-filter-name"
              v-model="filter.name_area"
              type="search"
              :placeholder="$t('momarea.momarea.placeholderAreaName')"
            />
          </b-form-group>
          <b-form-group
            :label="$t('momarea.momarea.labelUsers')"
            label-for="momarea-filter-users"
            class="flex-grow-1 mb-0"
          >
            <b-form-input
              id="momarea-filter-users"
              v-model="filter.user_area"
              type="search"
              :placeholder="$t('momarea.momarea.placeholderUserFilter')"
            />
          </b-form-group>
          <b-button
            type="submit"
            variant="primary"
            class="flex-shrink-0"
          >
            <b-icon
              icon="search"
              aria-hidden="true"
              class="me-1"
            />
            {{ $t('momarea.momarea.btnFilter') }}
          </b-button>
        </div>
      </b-form>
      <div class="d-flex flex-wrap justify-content-end mt-2">
        <b-button
          to="/momarea/export"
          variant="outline-primary"
          class="momarea-action-link me-2 mb-2 mb-sm-0"
        >
          <b-icon
            icon="download"
            aria-hidden="true"
            class="me-1"
          />
          {{ $t('momarea.momarea.btnGoToExport') }}
        </b-button>
        <b-button
          v-if="isAuthorized('admin')"
          to="/momarea/add"
          variant="success"
          class="momarea-action-link"
        >
          <b-icon
            icon="plus"
            aria-hidden="true"
            class="me-1"
          />
          {{ $t('momarea.momarea.btnAddArea') }}
        </b-button>
      </div>
    </div>

    <b-card
      no-body
      class="shadow-sm mb-3"
    >
      <b-table
        striped
        hover
        class="mb-0"
        :items="areas"
        :fields="fields"
        :busy="loading"
        :caption="$t('momarea.momarea.tableCaption')"
        caption-top
        show-empty
      >
        <template #table-busy>
          <div
            class="text-center my-3"
            role="status"
          >
            <b-spinner
              class="align-middle"
              :label="$t('momarea.export.loading')"
            />
            <span class="ms-2">{{ $t('momarea.export.loading') }}</span>
          </div>
        </template>
        <template #cell(name)="row">
          {{ row.item.name }}
        </template>
        <template #cell(city)="row">
          {{ row.item.city }}
        </template>
        <template #cell(province)="row">
          {{ row.item.province }}
        </template>
        <template #cell(polygon)="row">
          <span
            v-if="row.item.polygon != null"
            class="text-success"
            :aria-label="$t('momarea.momarea.fieldName') + ' - ' + $t('momarea.momarea.fieldPerimeter') + ': ' + $t('momarea.momarea.perimeterYes')"
          >
            <b-icon
              icon="check-circle-fill"
              aria-hidden="true"
            />
            <span class="ms-1">{{ $t('momarea.momarea.perimeterYes') }}</span>
          </span>
          <span
            v-else
            class="text-muted"
            :aria-label="$t('momarea.momarea.fieldName') + ' - ' + $t('momarea.momarea.fieldPerimeter') + ': ' + $t('momarea.momarea.perimeterNo')"
          >
            <b-icon
              icon="dash-circle"
              aria-hidden="true"
            />
            <span class="ms-1">{{ $t('momarea.momarea.perimeterNo') }}</span>
          </span>
        </template>
        <template #cell(users)="row">
          {{ row.item.users.length > 0 ? row.item.users[0].email : "" }}
          <b-button
            v-if="row.item.users.length >= 2"
            variant="link"
            size="sm"
            class="p-0 align-baseline"
            :aria-label="$t('momarea.momarea.moreUsersLabel')"
            :title="row.item.users.slice(1).map(user => user.email).join(', ')"
          >
            {{ "[+" + (row.item.users.length - 1) + "]" }}
          </b-button>
        </template>
        <template #cell(actions)="row">
          <span class="actions-cell">
            <b-link
              v-if="isAuthorized('admin')"
              :to="`/momarea/edit/${row.item.id}`"
              class="btn-icon-action"
              :title="$t('momarea.momarea.titleEditAreaNamed', { name: row.item.name })"
              :aria-label="$t('momarea.momarea.titleEditAreaNamed', { name: row.item.name })"
            >
              <b-icon
                icon="pencil"
                aria-hidden="true"
              />
            </b-link>
            <b-button
              v-if="isAuthorized('admin')"
              variant="link"
              class="btn-icon-action text-danger"
              :aria-label="$t('momarea.momarea.titleDeleteAreaNamed', { name: row.item.name })"
              :title="$t('momarea.momarea.titleDeleteAreaNamed', { name: row.item.name })"
              @click="confirmDelete(row.item)"
            >
              <b-icon
                icon="trash"
                aria-hidden="true"
              />
            </b-button>
          </span>
        </template>
        <template #empty>
          <div class="text-center my-4">
            <p class="text-muted mb-2">
              {{ $t('momarea.momarea.emptyAreas') }}
            </p>
            <b-button
              v-if="isAuthorized('admin')"
              to="/momarea/add"
              variant="success"
              size="sm"
            >
              <b-icon
                icon="plus"
                aria-hidden="true"
                class="me-1"
              />
              {{ $t('momarea.momarea.btnAddArea') }}
            </b-button>
          </div>
        </template>
      </b-table>
    </b-card>
  </div>
</template>

<script>
import Util from "@/mixing/util";
import AreaService from "../area.service";
import { toast, confirm } from "@/services/notification.service";

export default {
	name: "MomareaIndex",
	mixins: [Util],
	data() {
		return {
			areas: [],
			loading: false,
			fields: [
				{ key: "name", label: this.$t('momarea.momarea.fieldName') },
				{ key: "city", label: this.$t('momarea.momarea.fieldCity') },
				{ key: "province", label: this.$t('momarea.momarea.fieldProvince') },
				{ key: "polygon", label: this.$t('momarea.momarea.fieldPerimeter') },
				{ key: "users", label: this.$t('momarea.momarea.fieldUsers') },
				{ key: "actions", label: this.$t('momarea.momarea.fieldActions') },
			],
			filter: {
				name_area: null,
				user_area: null,
			},
		};
	},
	created() {
		this.loadAreas();
	},
	methods: {
		async loadAreas() {
			this.loading = true;
			try {
				this.areas = (await AreaService.indexAreas(this.filter.name_area, this.filter.user_area)).data.areas;
			} catch (e) {
				toast(this.$t('momarea.momarea.loadError'), {
					title: this.$t('momarea.export.titleError'),
					variant: "danger",
				});
			} finally {
				this.loading = false;
			}
		},
		filterarea() {
			this.loadAreas();
		},
		async confirmDelete(area) {
			const ok = await confirm(
				this.$t('momarea.momarea.confirmDeleteBody'),
				{
					title: this.$t('momarea.momarea.confirmDeleteTitle'),
					variant: "danger",
					okTitle: this.$t('momarea.momarea.confirmDeleteOk'),
					cancelTitle: this.$t('momarea.momarea.confirmDeleteCancel'),
				}
			);
			if (!ok) {
				return;
			}
			try {
				await AreaService.deleteArea(area.id);
				this.areas = this.areas.filter(a => a.id != area.id);
				toast(this.$t('momarea.momarea.deleteSuccess'), {
					title: this.$t('momarea.momarea.titleDeleteArea'),
					variant: "success",
				});
			} catch (e) {
				toast(this.$t('momarea.momarea.deleteError'), {
					title: this.$t('momarea.export.titleError'),
					variant: "danger",
				});
			}
		},
	},
};
</script>

<style scoped>
.actions-cell {
	display: inline-flex;
	gap: 0.25rem;
	align-items: center;
}

.btn-icon-action {
	padding: 4px 8px;
}

.momarea-action-link {
	text-decoration: none;
}

/* Shared Paper Dashboard SCSS strips focus outlines app-wide; restore a visible
   focus indicator scoped to this module (WCAG 2.4.7). */
.momarea-page :focus-visible {
	outline: 2px solid currentColor;
	outline-offset: 2px;
}
</style>

<!-- The b-table renders th/td in a child component, so a scoped selector cannot
     reach them; this non-scoped block overrides the Paper Dashboard light-gray
     table-header/muted text with #495057 (~7:1 on white) to meet WCAG 2.1 AA
     contrast (1.4.3). Mirrors the override already present in export.vue. -->
<style>
.momarea-page .text-muted,
.momarea-page small,
.momarea-page .small,
.momarea-page .page-link,
.momarea-page .btn-link,
.momarea-page .custom-select,
.momarea-page .form-control,
.momarea-page .table th,
.momarea-page .table td,
.momarea-page .table caption,
.momarea-page strong {
	color: #495057 !important;
}

/* Issue 57 (a11y): Paper Dashboard's .btn base styles (btn-styles() mixin in
   _buttons.scss) set an explicit `color: $default-states-color` on
   `.btn-link:hover/:focus/:active`, which OVERRIDES the inherited
   `.text-danger`/`.text-danger:hover` color (paper/_typography.scss,
   $danger-states-color: #B33C12) as soon as this <b-button variant="link">
   is hovered or focused - the icon silently turns grey instead of staying
   red. #B33C12 mirrors $danger-states-color exactly (same value already
   used at rest by .text-danger); this file's <style> block is plain CSS
   (no SCSS vars available), see host CLAUDE.md "Phase 16" for the general
   pitfall this is an instance of. */
.momarea-page .btn-icon-action.text-danger:hover,
.momarea-page .btn-icon-action.text-danger:focus {
	color: #B33C12 !important;
}
</style>
