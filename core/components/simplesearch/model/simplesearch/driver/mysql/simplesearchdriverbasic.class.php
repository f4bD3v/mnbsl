<?php
/**
 * SimpleSearch
 *
 * Copyright 2010-11 by Shaun McCormick <shaun+sisea@modx.com>
 *
 * This file is part of SimpleSearch, a simple search component for MODx
 * Revolution. It is loosely based off of AjaxSearch for MODx Evolution by
 * coroico/kylej, minus the ajax.
 *
 * SimpleSearch is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation; either version 2 of the License, or (at your option) any later
 * version.
 *
 * SimpleSearch is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * SimpleSearch; if not, write to the Free Software Foundation, Inc., 59 Temple Place,
 * Suite 330, Boston, MA 02111-1307 USA
 *
 * @package simplesearch
 */
/**
 * The base MySQL class for SimpleSearch
 *
 * @package simplesearch
 */
require_once strtr(realpath(dirname(dirname(__FILE__))), '\\', '/') . '/simplesearchdriverbasic.class.php';
class SimpleSearchDriverBasic_mysql extends SimpleSearchDriverBasic {

    /**
     * add relevancy search criteria to query
     *
     * @param xPDOQuery $query
     * @param array $options
     * @param string $options['class'] class name (not currently used but may be needed with custom classes)
     * @param string $options['fields'] query-ready list of fields to search for the terms
     * @param array $options['terms'] search terms (will only be one array member if useAllWords parameter is set)
     * @return void
     */
    public function addRelevancyCondition(&$query, $options) {
        $class = $this->modx->getOption('class', $options, 'modResource');
        $fields = $this->modx->getOption('fields', $options, '');
        $terms = $this->modx->getOption('terms', $options, array());
        if(!empty($fields)) {
            foreach($terms as $term) {
                $query->where("MATCH ( {$fields} ) AGAINST ( {$term} IN BOOLEAN MODE )");
            }
        }
        return true;
    }
}